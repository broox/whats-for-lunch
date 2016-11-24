var dataFile = './data/restaurants.yml';

var Lunch = new Vue({
  el: '#lunch-options',
  data: function() {
    return {
      cuisines: [],
      error: null,
      restaurants: [],
      suggestedCuisine: null,
      suggestedRestaurants: []
    };
  },
  created: function() {
    this.loadRestaurants();
    window.onhashchange = this.getSuggestionsFromURL;
  },
  computed: {
    buttonText: function() {
      return this.suggestedCuisine ? "How about something else?" : "What's for lunch?";
    }
  },
  methods: {
    filterRestaurants: function(cuisine) {
      // Filter restaurants by a given cuisine
      var matches = [];
      for (var i = 0, l = this.restaurants.length; i < l; i++) {
        var restaurant = this.restaurants[i];
        if (restaurant.cuisines.indexOf(cuisine) !== -1) {
          matches.push(restaurant);
        }
      }
      return matches;
    },
    getRandomCuisine: function() {
      // Return the name of a random cuisine
      var min = 0;
      var max = this.cuisines.length;
      var index = Math.floor(Math.random() * (max - min)) + min;
      var newcuisine = {};

      newcuisine = this.suggestedCuisine == this.cuisines[index] ? this.getRandomCuisine() : this.cuisines[index];

      return newcuisine;
    },
    getRandomSuggestions: function() {
      // Suggest a random cuisine with matching restaurant options
      var randomCuisine = this.getRandomCuisine();
      this.getCuisineSuggestions(randomCuisine);
      this.trackEvent('cuisine', 'random', randomCuisine);
    },
    getCuisineSuggestions: function(cuisine) {
      // Suggest restaurants based on a given cuisine
      cuisine = cuisine || 'food';
      this.suggestedRestaurants = this.filterRestaurants(cuisine);
      if (!this.suggestedRestaurants.length) {
        this.suggestedCuisine = null;
        this.suggestedRestaurants = [];
        this.error = 'No ' + cuisine + ' for you';
        this.trackEvent('cuisine', 'not found', cuisine);
      } else {
        this.suggestedCuisine = cuisine;
        this.error = null;
        window.location.href = '#' + cuisine;
        this.trackEvent('cuisine', 'found', this.suggestedRestaurants.length + ' restaurants');
      }
    },
    getSuggestionsFromURL: function() {
      // Suggest restaurants based on a cuisine in the URL
      var cuisine = window.location.hash.substr(1);
      if (cuisine) {
        this.getCuisineSuggestions(cuisine);
        this.trackEvent('cuisine', 'url', cuisine);
      } else {
        this.trackEvent('cuisine', 'url', '');
      }
    },
    handleDataError: function() {
      // Handle any kind of error when loading restaurant data
      this.error = 'oops, it broke';
      this.trackEvent('data', 'load', 'error');
    },
    loadRestaurants: function() {
      // Read the restaurant datafile
      var client = new XMLHttpRequest();
      client.addEventListener('load', function() {
        if (client.status === 200) {
          this.setLocalData(client.responseText);
          this.getSuggestionsFromURL();
        } else {
          this.handleDataError();
        }
      }.bind(this));

      client.addEventListener('error', function() {
        this.handleDataError();
      }.bind(this));

      client.open('GET', dataFile);
      client.send();
    },
    lookupRestaurant: function(restaurant) {
      // Open a google search for a given restaurant
      var url = 'https://www.google.com/search?q='+restaurant.name+', Des Moines, IA';
      var tab = window.open(url, '_blank');
      tab.focus();
      this.trackEvent('restaurant', 'lookup', restaurant.name);
    },
    setLocalData: function(data) {
      // Translate the data from the YAML file into javascript objects
      var jsData = jsyaml.load(data);
      this.cuisines = jsData.cuisines;
      this.restaurants = jsData.restaurants;
      this.trackEvent('data', 'load', 'success');
    },
    trackEvent: function(category, action, label) {
      // Track an event with Google Analytics
      if (window.ga) {
        ga('send', 'event', category, action, label);
      } else if (window.console) {
        console.log(category, action, label);
      }
    }
  }
});
