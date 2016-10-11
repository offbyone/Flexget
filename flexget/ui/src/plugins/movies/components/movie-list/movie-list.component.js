/* global angular */
(function () {
    'use strict';

    angular
        .module('plugins.movies')
        .component('movieList', {
            templateUrl: 'plugins/movies/components/movie-list/movie-list.tmpl.html',
            controller: movieListController,
            controllerAs: 'vm',
            bindings: {
                list: '<',
                deleteMovieList: '&',
                tabIndex: '<',
                linkHeader: '=',
                currentPage: '=',
                loadMovies: '='
            }
        });


    function movieListController($mdDialog, $sce, moviesService, $rootScope) {
        var vm = this;

        vm.$onInit = activate;
        vm.$onDestroy = destroy;
        vm.tabSelected = tabSelected;
        vm.tabDeselected = tabDeselected;
        vm.loadMovies = loadMovies;
        vm.deleteMovie = deleteMovie;

        var listener;
        var currentTab = false;

        var options = {
            'per_page': 10,
            order: 'asc'
        };

        function tabSelected() {
            loadMovies(1);
            currentTab = true;
        }

        function tabDeselected() {
            currentTab = false;
        }
        
        function activate() {
            //Hack to make the movies from the first tab load (md-on-select not firing for initial tab)
            if (vm.tabIndex === 0) {
                loadMovies(1);
                currentTab = true;
            }

            listener = $rootScope.$on('movie-added-list:' + vm.list.id, function () {
                if (currentTab) {
                    loadMovies(vm.currentPage);
                }
            });
        }

        function destroy() {
            if (listener) {
                listener();
            }
        }

        function loadMovies(page) {
            options.page = page;
            moviesService.getListMovies(vm.list.id, options)
                .then(setMovies)
                .cached(setMovies)
                .finally(function () {
                    vm.currentPage = options.page;
                });
        }

        function setMovies(response) {
            vm.movies = response.data;
            vm.linkHeader = response.headers().link;
        }

        function deleteMovie(list, movie) {
            var confirm = $mdDialog.confirm()
                .title('Confirm deleting movie from list.')
                .htmlContent($sce.trustAsHtml('Are you sure you want to delete the movie <b>' + movie.title + '</b> from list <b>' + list.name + '</b>?'))
                .ok('Forget')
                .cancel('No');

            $mdDialog.show(confirm).then(function () {
                moviesService.deleteMovie(list.id, movie.id)
                    .then(function () {
                        loadMovies(vm.currentPage);
                    });
            });
        }
    }
}());
