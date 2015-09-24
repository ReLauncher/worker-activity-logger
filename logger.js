var firebase_reference = new Firebase("https://crowdworker-logger.firebaseio.com/trials");

firebase_reference.push({
  pathname: document.location.pathname,
  search: document.location.search,
  hostname: document.location.hostname,
  hash: document.location.hash
});
