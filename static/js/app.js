var dataFile = './data/restaurants.yml';

var Lunch = new Vue({
  el: '#lunch-template',
  data: function() {
    return {
      accessibility: [],
      cuisines: [],
      loading: true,
      restaurants: [],
      suggestedCuisine: undefined,
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
      return this.cuisines[index];
    },
    getRandomSuggestions: function() {
      // Suggest a random cuisine with matching restaurant options
      var randomCuisine = this.getRandomCuisine();
      this.getCuisineSuggestions(randomCuisine);
    },
    getCuisineSuggestions: function(cuisine) {
      // Suggest restaurants based on a given cuisine
      cuisine = cuisine || 'food';
      this.suggestedRestaurants = this.filterRestaurants(cuisine);
      if (!this.suggestedRestaurants.length) {
        this.suggestedCuisine = null;
        this.suggestedRestaurants = [];
        this.error = 'No ' + cuisine + ' for you';
      } else {
        this.suggestedCuisine = cuisine;
        this.error = null;
        window.location.href = '#' + cuisine;
      }
    },
    getSuggestionsFromURL: function() {
      // Suggest restaurants based on a cuisine in the URL
      var cuisine = window.location.hash.substr(1);
      if (cuisine) {
        this.getCuisineSuggestions(cuisine);
      }
    },
    handleDataError: function() {
      // Handle any kind of error when loading restaurant data
      this.loading = false;
      this.error = 'oops, it broke';
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
    setLocalData: function(data) {
      // Translate the data from the YAML file into javascript objects
      var jsData = jsyaml.load(data);
      this.loading = false;
      this.cuisines = jsData.cuisines;
      this.restaurants = jsData.restaurants;
    }
  }
});
