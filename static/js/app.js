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
      this.suggestedCuisine = this.getRandomCuisine();
      this.suggestedRestaurants = this.filterRestaurants(this.suggestedCuisine);
      console.log('suggesting:', this.suggestedCuisine);
      console.log(' - ', this.suggestedRestaurants);
    },
    handleDataError: function() {
      // Handle any kind of error when loading restaurant data
      this.loading = false;
      alert('Error loading restaurant data');
    },
    loadRestaurants: function() {
      // Read the restaurant datafile
      var client = new XMLHttpRequest();
      client.addEventListener('load', function() {
        if (client.status === 200) {
          this.setLocalData(client.responseText);
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
      console.log('cuisines:', this.cuisines);
      console.log('restaurants:', this.restaurants);
    }
  }
});
