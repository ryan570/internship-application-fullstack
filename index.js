addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

//This HTMLRewriter is used to replace content in the selected variant 
const REWRITER = new HTMLRewriter()
  .on('title', { element: e => e.setInnerContent("Hello!") })
  .on('h1#title', { element: e => e.setInnerContent("It works!") })
  .on('p#description', { element: e => e.setInnerContent("I don't have a personal website :(") })
  .on('a#url', { element: e => e.setInnerContent('So here is my Github') })
  .on('a#url', { element: e => e.setAttribute('href', 'https://github.com/ryan570') });

//URL for the api
const url = 'https://cfw-takehome.developers.workers.dev/api/variants';

//Function to get a cookie based on its name
function getCookie(request, name) {
  //return null if no cookies match the requested name
  let out = null;
  let cookies = request.headers.get('Cookie');

  //If the page has any cookies, search for it by name
  if (cookies) {
    cookies.split(";").forEach((cookie) => {
      //Split each cookie into an array of its name and content
      let splitCookie = cookie.split("=");

      //If name matches, set out to cookie content
      if (splitCookie[0].trim() == name) {
        out = splitCookie[1];
      }
    })
  }
  return out;
}

//Called when a request is made to the page
async function handleRequest(request) {
  //Get the value for the "index" cookie
  const cookie = getCookie(request, "index");

  //Fetch array of variants from given url and transform to JSON
  const apiResponse = await fetch(url)
    .then(response => response.json())
    .catch(err => console.log(err));

  //Set index to cookie if the cookie exists, otherwise to random integer either 0 or 1
  let index = (cookie !== null) ? cookie : Math.floor(Math.random() * 2);

  //fetch one of two variants from the array of variant urls found earlier
  const res = await fetch(apiResponse.variants[index])
    .catch(err => console.log(err));

  //apply HTMLRewriter to variant response and create a new response based on it
  out = new Response(REWRITER.transform(res).body);
  //set cookie "index" to the index value so each user sees same variant every time
  out.headers.set('Set-Cookie', "index=" + index);

  return out;
}