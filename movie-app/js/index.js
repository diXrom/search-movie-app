console.log(`
1.Вёрстка, дизайн, UI +20
    - внешний вид приложения соответствует предложенному образцу или является его улучшенной версией +5
    - вёрстка адаптивная. Приложения корректно отображается и отсутствует полоса прокрутки при ширине страницы от 1920рх до 768рх +5
    - интерактивность элементов, с которыми пользователи могут взаимодействовать, изменение внешнего вида самого элемента и состояния курсора при наведении, использование разных стилей для активного - и неактивного состояния элемента, плавные анимации +5
    - в футере приложения есть ссылка на гитхаб автора приложения, год создания приложения, логотип курса со ссылкой на курс +5
2.При загрузке страницы приложения отображаются карточки с информацией о фильмах по произвольному, указанному разработчиком запросу +10
3.На каждой карточке есть постер фильма, название фильма, его рейтинг на IMDb, а также описание фильма или другая информация о нём, которую предоставляет API +10
4.Поиск +10
    - при открытии приложения курсор находится в поле ввода +2
    - автозаполнение поля ввода отключено (нет выпадающего списка с предыдущими запросами) +2
    - есть placeholder +2
    - поисковый запрос вводится нажатием клавиши Enter +2
    - в поле ввода есть кнопка "Очистить", которая визуально представлена в виде крестика. При клике по кнопке "Очистить" поле ввода очищается +2
5.Если в поле поиска ввести слово, отображаются фильмы, в названиях которых есть это слово, если такие данные предоставляет API +10
6.После ввода поискового запроса и отображения результатов поиска, набранный запрос отображается в поле ввода +5
`);

const createCards = function () {

    const form = document.querySelector('.form'),
        search = document.querySelector('.search'),
        cardInner = document.querySelector('.cards'),
        resetBtn = document.querySelector('.clear'),
        searchList = document.querySelector('.search-list'),
        modal = document.querySelector('.modal');
    const getData = async url => {
        let response = await fetch(url);
        if (!response.ok) { throw new Error(`Ошибка статус ${response.status}`); }
        return await response.json();
    };
    const searchFilms = (str) => {
        getData(`https://api.themoviedb.org/3/search/movie?api_key=124e821e9b8de02f2bd7bc0d63125e9e&query=${str}`)
            .then(array => {
                cardInner.innerHTML = '';
                if (array.results.length === 0) alert('По вашему запросу ничего не найденно')
                array.results.forEach(({ poster_path, original_title, vote_average, overview, parentSelector = '.cards' }) => {
                    new cardItem(`https://image.tmdb.org/t/p/w1280/${poster_path}`, original_title, vote_average, overview, parentSelector, 'card'
                    ).render();
                });
                hideModal();
            }
            );
    };
    class cardItem {
        constructor(src, title, score, review, parentSelector, selector) {
            this.src = src;
            this.title = title;
            this.score = score;
            this.selector = selector;
            this.parent = document.querySelector(parentSelector);
            this.getShortReview(review);
            this.getColorScore(score);
        }
        getShortReview(str) {
            this.review = str.slice(0, str.includes('.') ? str.indexOf('.') > 160 ? 150 : str.indexOf('.') + 1 : 150).replace(/(s$)|(.$)/, '...');
        }
        getColorScore(num) {
            this.class = num < 5 ? 'red' : num <= 7.5 ? 'yellow' : 'green';
        }
        render() {
            let div = document.createElement('div');
            div.classList.add(`${this.selector}`);
            div.innerHTML = `<img src=${this.src} alt=${this.title}>
                            <div class="card__content">
                                <h2 class="card__title">${this.title}</h2>
                                <span class="score ${this.class}">${this.score}</span>
                            </div>
                            <div class="review">
                                <h2 class="review__title">Review</h2>
                                <div class="review__text">${this.review}</div>
                        </div>`;
            this.parent.append(div);
        }
    }
    getData('https://api.themoviedb.org/3/discover/movie?&api_key=124e821e9b8de02f2bd7bc0d63125e9e&with_cast=2963&without_genres=16')
        .then(array => array.results.forEach(({ poster_path, original_title, vote_average, overview, parentSelector = '.cards' }) => {
            new cardItem(`https://image.tmdb.org/t/p/w1280/${poster_path}`, original_title, vote_average, overview, parentSelector, 'card')
                .render();
        }));
    resetBtn.addEventListener('click', (e) => {
        form.reset();
        searchList.classList.remove('show');
    });
    document.addEventListener('keydown', (e) => {
        if (e.code !== 'Enter') return;
        e.preventDefault();
        searchList.classList.remove('show');
        searchFilms(search.value)
    });

    const showModal = () => {
        modal.style.opacity = 1;
        modal.style.zIndex = 9;
    }
    const hideModal = () => {
        modal.style.opacity = 0;
        modal.style.zIndex = -9;
    }
    search.addEventListener('click', showModal);
    search.addEventListener('focusout', hideModal);
    document.addEventListener('scroll', hideModal);
    search.addEventListener('input', (e) => {
        if (!search.value) {
            searchList.classList.remove('show');
            return;
        }
        getData(`https://api.themoviedb.org/3/search/movie?api_key=124e821e9b8de02f2bd7bc0d63125e9e&query=${search.value}`)
            .then(array => {
                searchList.innerHTML = '';
                if (array.results.length === 0) {
                    searchList.classList.remove('show');
                    return;
                }
                searchList.classList.add('show');
                array.results.splice(0, 5).forEach(({ poster_path, original_title, vote_average, overview, parentSelector = '.cards' }) => {
                    const filmTitle = document.createElement('h2');
                    filmTitle.classList.add('card__title');
                    filmTitle.innerHTML = original_title;
                    filmTitle.addEventListener('click', () => {
                        search.value = original_title;
                        searchList.classList.remove('show');
                        cardInner.innerHTML = '';
                        new cardItem(`https://image.tmdb.org/t/p/w1280/${poster_path}`, original_title, vote_average, overview, parentSelector, 'card').render();
                    });
                    searchList.append(filmTitle);
                });
            });
    })
};
createCards();

