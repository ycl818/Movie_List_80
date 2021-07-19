const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const MOVIES_PER_PAGE = 12

const movies = []
let filterMovies = []
let style = ''
let currentPage = 1

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const inputValue = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')
const displaySelector = document.querySelector('#displaySelector')

// grid mode
function renderMovieList(data) {
  let rawHTML = ''
  // processing
  data.forEach((item) => {
    // title, image
    rawHTML += `<div class="col-sm-3">
        <div class="mb-2 mt-2">
          <div class="card">
            <img src="${POSTER_URL + item.image}" class="card-img-top" alt="Movie Post">
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">More</button>
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
            </div>
          </div>
        </div>
      </div>
    </div>`
  })

  dataPanel.innerHTML = rawHTML
}

// list mode 
function renderToList(data){
  let rawHTML =''
  data.forEach(item => {
    rawHTML += `
      <div class="col-12">
        <div class="mb-2 mt-2">
          <div class="card  d-flex flex-row">
            <div class="mt-2 col-8">
               <h5 class="card-title text-center  ">${item.title}</h5>
            </div>
    
            <div class="col-4 d-grid gap-2 d-md-flex justify-content-md-end">
              <button class="btn btn-primary btn-show-movie  " data-bs-toggle="modal" data-bs-target="#movie-modal"
              data-id="${item.id}">More</button>
              <button class="btn btn-info btn-add-favorite  " data-id="${item.id}">+</button>
            </div>
           
          </div>
        </div>
      </div>
    `
  })
  dataPanel.innerHTML = rawHTML
}

// choose mode
function displayStyle(page) {
  if (style === 'list') return renderToList(getMoviesByPage(page))
  return renderMovieList(getMoviesByPage(page))
}

function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  // 80 / 12 = 6 ... 8 = 7
  let rawHTML = ''

  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page='${page}'>${page}</a></li>`
  }

  paginator.innerHTML = rawHTML
  
}

// page 1 -> movies 0 - 11
// page 2 -> movies 12- 23
 
function getMoviesByPage(page) {
  // movies? "movies" : "filtermovies"
  const data = filterMovies.length ? filterMovies : movies

  const startIndex = (page-1) * MOVIES_PER_PAGE
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE )
}

function showMovieModal(id) {
  const modalTitle = document.querySelector("#movie-modal-title")
  const modalImage = document.querySelector("#movie-modal-image")
  const modalDate = document.querySelector("#movie-modal-date")
  const modalDescription = document.querySelector("#movie-modal-description")

  axios.get(INDEX_URL + id).then((response) => {
    //console.log(response)
    const data = response.data.results
    modalTitle.innerText = data.title
    modalDate.innerText = 'Release Date: ' + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `<img
                  src="${POSTER_URL + data.image}"
                  alt="movie-poster" class="img-fluid">`
  })
}

function addToFavorite(id) {
  //console.log(id)
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find(movie => movie.id === id)
  console.log(list)
  if (list.some(movie => movie.id === id)) {
    return alert('this movie has been added!')
  }
  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))

}


 
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    //console.log(event.target.dataset)
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-add-favorite')){
    addToFavorite(Number(event.target.dataset.id))
  }
})

paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return
  currentPage = Number(event.target.dataset.page)
  displayStyle(currentPage)
})

searchForm.addEventListener('submit', function(event) {
  event.preventDefault()
  // console.log(event) 
  
  const keywords = inputValue.value.trim().toLowerCase()
  currentPage = 1
  filterMovies = movies.filter(function(movie){
    return movie.title.toLowerCase().includes(keywords)
  })

  if (filterMovies.length === 0) {
    return alert("Can't not find movies with keywords: " + keywords)
  }

  renderPaginator(filterMovies.length)
  displayStyle(currentPage)
})

//監聽切換模式
displaySelector.addEventListener('click', function(event){
  console.log(event.target)
  if (event.target.matches('.gridMode')) {
    style = 'grid'
    displayStyle(currentPage)
  } else {
    style = 'list'
    displayStyle(currentPage)
  }
})


axios.get(INDEX_URL).then((response) => {
  //console.log(response.data.results)
  // for (const movie of response.data.results) {
  //   movies.push(movie)
  // }
  // const numbers = [1,2,3]
  // movies.push(1,2,3)
  //movies.push(...[1, 2, 3])
  movies.push(...response.data.results)
  renderPaginator(movies.length)
  renderMovieList(getMoviesByPage(1))
})

