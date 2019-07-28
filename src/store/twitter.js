import axios from 'axios'

const FEEDS = ['ranked', 'unranked']

export default {
  getters: {
    statusFeed: state => state.statusFeed
  },
  mutations: {
    UPDATE_FEED: updateFeed,
    UPDATE_FEED_W_LIKE: updateFeedwLike,
    UPDATE_FEED_W_POST: updateFeedwPost,
    UPDATE_FEED_W_RT: updateFeedwRetweet
  },
  /**
   * We need to be able to find and pop one status out of "unranked"
   * and reinsert into the ranked list.
   * Or consolidate comments / other rerenders.
   * So we use an "Index" Object (statusIndex) to store the position in list.
   * Then find it in statusFeed arrays by index.
   */
  state: {
    statusIndex: {},
    statusFeed: {
      ranked: [],
      unranked: []
    }
  },
  actions: {
    getPost: getPost,
    getPosts: getPosts,
    likeStatus: likeStatus,
    postTweet: postTweet,
    retweet: retweet
  }
}
/**
 * Get timeline posts
 * @param {*} param0
 */
async function getPosts({ commit, rootState }) {
  commit('SET_RETRIEVING_TWEETS', true)
  while (!rootState.accessToken.token) {
    console.log('waiting for twitter auth')
    await waitFor()
  }
  var params = {
    method: 'GET',
    url: process.env.SERVER_SOCIAL + '/posts',
    headers: {
      oauth_token: rootState.accessToken.token,
      oauth_consumer_key: rootState.accessToken.key
    }
  }
  return new Promise(async (resolve, reject) => {
    var tokenErr
    var response = await axios(params).catch(error => {
      console.log(error)
      tokenErr = true
      reject(error)
    })
    if (tokenErr) return

    console.log(response)
    commit('UPDATE_FEED', response.data)
    commit('SET_RETRIEVING_TWEETS', false)
    resolve(true)
  })
}

function updateFeed(state, data) {
  // Preprocess to save location index
  FEEDS.forEach(feed => {
    if (!data[feed] || !data[feed].length) return
    console.log(`${feed} LENGTH: ${data[feed].length}`)
    state.statusIndex[feed] = {}

    data[feed].forEach((post, i) => {
      state.statusIndex[feed][post.id_str] = i
    })
    console.log(state.statusIndex[feed])
  })

  // Do actual processing
  FEEDS.forEach(feed => {
    if (!data[feed] || !data[feed].length) return

    data[feed].forEach(post => {
      processPost({
        postId: post.id_str,
        feedName: feed,
        data: data,
        statusIndex: state.statusIndex
      })
    })
  })

  // Remove fragments
  FEEDS.forEach(feed => {
    if (!data[feed] || !data[feed].length) return
    var len = data[feed].length - 1
    for (var j = len; j >= 0; j--) {
      if (data[feed][j].removeFragment) {
        var idToRemove = data[feed][j].id_str
        delete state.statusIndex[idToRemove]
        data[feed].splice(j, 1)
      }
    }
  })
  console.log('updateFeed results: ', data)
  state.statusFeed = data

  // Reset the index listing after the vue starts rendering.
  FEEDS.forEach(feed => {
    if (!data[feed] || !data[feed].length) return
    console.log(`${feed} LENGTH: ${data[feed].length}`)

    data[feed].forEach((post, i) => {
      state.statusIndex[feed][post.id_str] = i
    })
    console.log(state.statusIndex[feed])
  })
}

function updateFeedwLike(state, data) {
  var apiData = data.apiData
  apiData.full_text = data.inPlaceObj.full_text

  if (data.inPlaceObj) {
    data.inPlaceObj.spectroRankedNew = true
    data.inPlaceObj.favorited = true
  }

  // First check location of tweet.
  if (state.statusFeed.ranked && state.statusFeed.ranked.length) {
    var indexExists = state.statusIndex.ranked[apiData.id_str]
    if (typeof indexExists !== 'number') {
      //   state.statusFeed.ranked[indexExists].favorited = true
      // } else {
      state.statusFeed.ranked.push(apiData)
      state.statusIndex.ranked[apiData.id_str] = state.statusFeed.ranked.length
    }
  } else {
    state.statusFeed.ranked = []
    state.statusFeed.ranked.push(apiData)
    state.statusIndex.ranked = {}
    state.statusIndex.ranked[apiData.id_str] = 0
  }
  processPost({
    postId: apiData.id_str,
    feedName: 'ranked',
    data: state.statusFeed,
    statusIndex: state.statusIndex,
    postObj: apiData
  })
}

async function likeStatus({ commit, dispatch, rootState }, statusObj) {
  var tokenErr
  commit('SET_AWAITING_RECEIPT', true)

  var interactParams = {
    recipient: statusObj.user.screen_name,
    total: 5
  }
  await dispatch('interactTransaction', interactParams).catch(error => {
    console.log(error)
    tokenErr = true
  })
  if (tokenErr) return
  // Display msg clarifying that Transaction is different than API
  commit('SET_AWAITING_API', true)
  var params = {
    method: 'POST',
    url: process.env.SERVER_SOCIAL + '/engage',
    headers: {
      oauth_token: rootState.accessToken.token,
      oauth_consumer_key: rootState.accessToken.key
    },
    params: {
      action: 'favorite'
    },
    data: {
      stake: 5
    }
  }
  if (statusObj.retweeted_status) {
    params.params.statusId = statusObj.retweeted_status.id_str
  } else {
    params.params.statusId = statusObj.id_str
  }
  console.log(params)
  return new Promise(async (resolve, reject) => {
    var response = await axios(params).catch(error => {
      console.log(error)
      tokenErr = true
      reject(error)
    })
    if (tokenErr) return

    console.log('twitter API response: ', response)
    commit('UPDATE_FEED_W_LIKE', {
      inPlaceObj: statusObj,
      apiData: response.data
    })
    commit('SET_AWAITING_RECEIPT', false)
    commit('SET_AWAITING_API', true)
    resolve(true)
  })
}

async function retweet({ commit, dispatch, rootState }, statusObj) {
  var tokenErr
  commit('SET_AWAITING_RECEIPT', true)
  var interactParams = {
    recipient: statusObj.user.screen_name,
    total: 5
  }
  await dispatch('interactTransaction', interactParams).catch(error => {
    console.log(error)
    tokenErr = true
  })
  if (tokenErr) return
  commit('SET_AWAITING_API', true)
  var params = {
    method: 'POST',
    url: process.env.SERVER_SOCIAL + '/engage',
    headers: {
      oauth_token: rootState.accessToken.token,
      oauth_consumer_key: rootState.accessToken.key
    },
    params: {
      action: 'retweet'
    },
    data: {
      stake: 5
    }
  }
  if (statusObj.retweeted_status) {
    params.params.statusId = statusObj.retweeted_status.id_str
  } else {
    params.params.statusId = statusObj.id_str
  }
  console.log(params)
  return new Promise(async (resolve, reject) => {
    var response = await axios(params).catch(error => {
      console.log(error)
      tokenErr = true
      reject(error)
    })
    if (tokenErr) return

    console.log('twitter API response: ', response)
    commit('UPDATE_FEED_W_RT', {
      inPlaceObj: statusObj,
      apiData: response.data
    })
    commit('SET_AWAITING_RECEIPT', false)
    commit('SET_AWAITING_API', false)
    resolve(true)
  })
}

function updateFeedwRetweet(state, data) {
  var apiData = data.apiData
  apiData.full_text = data.inPlaceObj.full_text

  if (data.inPlaceObj) {
    data.inPlaceObj.spectroRankedNew = true
    data.inPlaceObj.retweeted = true
  }
  processPost({
    postId: apiData.id_str,
    feedName: 'ranked',
    data: state.statusFeed,
    statusIndex: state.statusIndex,
    postObj: apiData
  })

  // First check location of tweet.
  if (state.statusFeed.ranked && state.statusFeed.ranked.length) {
    var indexExists = state.statusIndex.ranked[apiData.id_str]
    if (typeof indexExists !== 'number') {
      //   state.statusFeed.ranked[indexExists].favorited = true
      // } else {
      state.statusFeed.ranked.push(apiData)
      state.statusIndex.ranked[apiData.id_str] = state.statusFeed.ranked.length
    }
  } else {
    state.statusFeed.ranked = []
    state.statusFeed.ranked.push(apiData)
    state.statusIndex.ranked = {}
    state.statusIndex.ranked[apiData.id_str] = 0
  }
}

function waitFor() {
  return new Promise(resolve => setTimeout(resolve, 200))
}

/**
 * entities: {
 *  media: [ ... this is an img we can embed ],
 *  urls: [
 *    ...if post has quoted_status object, this url to quoted tweet. Remove and render quoted twett as sub
 *    ...if post is a reply, this is a url to original tweet.
 *    ...TODO check if these are twitter embedded links and display them as embedded?
 *    ...TODO make non-twitter links into hyperlinks to display in twitter to see embedded
 *  ]
 * }
 */
function processPost(postMetadata) {
  var postId = postMetadata.postId
  var feedName = postMetadata.feedName
  var data = postMetadata.data
  var statusIndex = postMetadata.statusIndex
  var post
  var index

  // Sometimes this is called on item that isn't in the feed.
  if (postMetadata.postObj) post = postMetadata.postObj
  else {
    index = statusIndex[feedName][postId]
    post = data[feedName][index]
  }
  post.spectroFeed = feedName

  // Process attached retweet object
  if (post.retweeted_status) {
    post.retweeted_status.spectroChildDisplay = true
    postMetadata.postId = post.retweeted_status.id_str
    postMetadata.postObj = post.retweeted_status
    processPost(postMetadata)
  }

  // Remove End URL if is the quoted status.
  // This has to happen before string editing for pics/retweets
  if (post.quoted_status) {
    var quote_url = post.entities.urls[post.entities.urls.length - 1]
    post.quoted_status.spectroChildDisplay = true
    post.updatedText = post.full_text.substring(0, quote_url.indices[0])

    postMetadata.postId = post.quoted_status.id_str
    postMetadata.postObj = post.quoted_status
    processPost(postMetadata)
  }
  if (post.entities.media) {
    var media = post.entities.media[0]
    if (media.type === 'photo') {
      post.embedImg = media.media_url_https
      // Remove url from text:
      var pre = (post.full_text || post.text).substring(0, media.indices[0])
      var after = (post.full_text || post.text).substring(media.indices[1])
      post.updatedText = pre + after
    }
  }
  // Return the index of the tweet thread so it can be re-rendered
  var replyId = post.in_reply_to_status_id_str
  var replyIndex

  if (replyId) {
    FEEDS.forEach(feed => {
      if (statusIndex[feed] && typeof statusIndex[feed][replyId] === 'number') {
        replyIndex = statusIndex[feed][replyId]
        post.repliedToObj = data[feed][replyIndex]
        post.repliedToObj.spectroChildDisplay = true
        data[feed][replyIndex].removeFragment = true
      }
    })
  }
}

function getPost({ rootState, state }, post) {
  var params = {
    method: 'GET',
    url: process.env.SERVER_SOCIAL + '/engage',
    headers: {
      oauth_token: rootState.accessToken.token,
      oauth_consumer_key: rootState.accessToken.key
    },
    params: { individual: post.in_reply_to_status_id_str }
  }
  return new Promise(async (resolve, reject) => {
    var tokenErr
    var response = await axios(params).catch(error => {
      console.log(error)
      tokenErr = true
      reject(error)
    })
    if (tokenErr) return

    console.log(response)
    processPost({
      postId: response.data.id_str,
      feedName: post.spectroFeed,
      data: state.statusFeed,
      statusIndex: state.statusIndex,
      postObj: response.data
    })
    post.repliedToObj = response.data
    // Dont let it get rendered w/ padding and stuff:
    post.repliedToObj.spectroChildDisplay = true
    resolve(response)
  })
}
// function setCommentParent()

async function postTweet({ commit, dispatch, rootState }, status) {
  var tokenErr
  if (!status) return
  commit('SET_AWAITING_RECEIPT', true)

  var interactParams = {
    recipient: status.recipient,
    total: 5
  }
  await dispatch('interactTransaction', interactParams).catch(error => {
    console.log(error)
    tokenErr = true
  })

  if (tokenErr) return
  commit('SET_AWAITING_API', true)
  var params = {
    method: 'POST',
    url: process.env.SERVER_SOCIAL + '/post',
    // headers: {
    //   oauth_token: rootState.accessToken.token,
    //   oauth_consumer_key: rootState.accessToken.key
    // },
    params: {
      action: 'post'
    },
    data: {
      username: rootState.user.username,
      status: status.statusText,
      stake: 5
    }
  }
  if (status.replyId) params.data.replyId = status.replyId
  console.log(params)
  var tweetErr
  return new Promise(async (resolve, reject) => {
    var response = await axios(params).catch(error => {
      console.log(error)
      tweetErr = true
      reject(error)
    })
    if (tweetErr) return

    console.log('twitter API response: ', response)
    commit('UPDATE_FEED_W_POST', {
      apiData: response.data,
      replyId: status.replyId,
      // inPlaceObj: status.statusObj
      feed: status.feed
    })
    commit('SET_AWAITING_RECEIPT', false)
    commit('SET_AWAITING_API', false)
    resolve(true)
  })
}

function updateFeedwPost(state, data) {
  var id = data.apiData.id_str
  data.apiData.updatedText = data.apiData.text

  // If comment, splice the tweet into the current thread that's being replied
  if (data.replyId) {
    // if (data.inPlaceObj) {
    //   data.inPlaceObj.spectroRankedNew = true
    //   data.inPlaceObj.favorited = true
    // }
    processPost({
      postId: id,
      feedName: data.feed,
      data: state.statusFeed,
      statusIndex: state.statusIndex,
      postObj: data.apiData
    })
    data.apiData.spectroRankedNew = true
    var index = state.statusIndex[data.feed][data.replyId]
    if (index) {
      state.statusFeed[data.feed].splice(index, 1, data.apiData)
      state.statusFeed.ranked.forEach((post, i) => {
        state.statusIndex.ranked[post.id_str] = i
      })
    }
    if (data.feed !== 'ranked') {
      state.statusFeed.ranked.push(data.apiData)
      state.statusIndex.ranked[id] = state.statusFeed.ranked.length
    }
  } else {
    // Else add tweet at top of page, right below the comment form
    state.statusFeed.ranked.unshift(data.apiData)
    state.statusFeed.ranked.forEach((post, i) => {
      state.statusIndex.ranked[post.id_str] = i
    })
  }
}
