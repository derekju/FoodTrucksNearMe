(function () {

	/**
	 * Represents a single address
	 */
	var Address = Backbone.Model.extend({
		defaults: {
			location: '',
			latitude: 0.0,
			longitude: 0.0
		}
	});

	/**
	 * Collection of addresses
	 * Backed by local storage
	 */
	var AddressList = Backbone.Collection.extend({
		model: Address,
		localStorage: new Backbone.LocalStorage('FT.AddressCache'),
	});

	/**
	 * Represents a single food truck
	 */
	var Truck = Backbone.Model.extend({
		defaults: {
			latitude: 0.0,
			longitude: 0.0,
			applicant: '',
			fooditems: ''
		}
	});

	/**
	 * Collection of food trucks
	 * Fetches from the server
	 */
	var TruckList = Backbone.Collection.extend({
		model: Truck,
		url: '/ajax/get_foodtrucks.php'
	});

	/**
	 * Navigation view
	 */
	var NavView = Backbone.View.extend({
		el: $('.nav-bar'),

		loadingTemplate: _.template('<img src="static/images/ajax-loader.gif" /><span class="loadingText">Loading</span>'),

		resultsTemplate: _.template('<%= num %> <%= resultsText %>'),

		events: {
			'keypress #address_input': 'addressEntered',
			'click #address_submit': 'addressSubmitted'
		},

		addressEntered: function (e) {
			if (e.keyCode == 13) {
				this.addressSubmitted();
			}
		},

		addressSubmitted: function (e) {
			this.trigger(
				'newAddress',
				this.addressInput.val()
			);
		},

		renderLoading: function () {
			$('.loading-area-and-results').html(this.loadingTemplate());
		},

		renderResultCount: function () {
			$('.loading-area-and-results').html(
				this.resultsTemplate({
					num: TruckListObject.length,
					resultsText: TruckListObject.length == 1 ? 'Result' : 'Results'
				})
			);
		},

		initialize: function () {
			this.addressInput = $('#address_input');
			this.addressInput.val('San Francisco, CA');

			// Listen for when the collection resets with new data
			this.listenTo(TruckListObject, 'reset', this.renderResultCount);			
		}

	});

	// Closure variable of map markers
	_markers = [];
	// Closure variable of info windows
	_infoWindow = null;

	/**
	 * View wrapping the Google map
	 */
	var MapView = Backbone.View.extend({

		el: $('#map-canvas'),

		/**
		 * Lookup an address in our collection and call a callback with it
		 */
		lookupAddressInfo: function (address, callback) {
			var loc = AddressListObject.where({
				location: address
			});

			if (loc.length == 0) {
				var thisPtr = this;
				this._geocoder.geocode(
					{
						address: address
					},
					function (results, status) {
						if (status == google.maps.GeocoderStatus.OK) {
							loc = AddressListObject.create({
								location: address,
								latitude: results[0].geometry.location.lat(),
								longitude: results[0].geometry.location.lng()
							});

							callback.call(thisPtr, loc);
						}
					}
				);
			} else {
				callback.call(this, loc[0]);
			}
		},

		/**
		 * Pan the map to a specific address
		 */
		panMap: function (newAddress) {
			this.lookupAddressInfo(newAddress, function (result) {
				this.gmap.panTo(
					new google.maps.LatLng(
						result.get('latitude'),
						result.get('longitude')
					)
				);
				this.mapPanned();
			});
		},

		/**
		 * Callback after the map has been panned
		 */
		mapPanned: function () {

			// Clear active markers
			_.each(_markers, function (element, index, list) {
				element.setMap(null);
			});

			// Send an event that the map was panned
			this.trigger('mapPanned');

			// Reset our collection with all trucks in the map bounds
			TruckListObject.fetch({
				data: {
					neLat: this.gmap.getBounds().getNorthEast().lat(),
					neLng: this.gmap.getBounds().getNorthEast().lng(),
					swLat: this.gmap.getBounds().getSouthWest().lat(),
					swLng: this.gmap.getBounds().getSouthWest().lng()
				},
				reset: true
			});
		},

		/**
		 * Draw the markers on the map
		 */
		renderMarkers: function () {

			TruckListObject.forEach(function (element, index, list) {
				var infoWindow = new google.maps.InfoWindow({
					content: element.get('applicant')
				});

				var marker = new google.maps.Marker({
					position: new google.maps.LatLng(element.get('latitude'), element.get('longitude')),
					map: this.gmap,
					title: element.get('applicant')
				});
				_markers.push(marker);

				var gmapRef = this.gmap;
				google.maps.event.addListener(marker, 'click', function() {
					if (_infoWindow) {
						_infoWindow.close();
					}
					_infoWindow = infoWindow;
					_infoWindow.open(gmapRef, marker);
				});
			}, this);
		},

		/**
		 * Initialize our Google map
		 */
		initializeMap: function () {

			var defaultAddress = 'San Francisco, CA';

			this.lookupAddressInfo(defaultAddress, function (result) {
				var mapOptions = {
					center: new google.maps.LatLng(result.get('latitude'), result.get('longitude')),
					zoom: 16,
					panControl: false,
					streetViewControl: false
				};
				this.gmap = new google.maps.Map(
					this.el,
					mapOptions
				);

				// Fire initial load
				google.maps.event.addListenerOnce(this.gmap, 'idle', this.mapPanned);

				// Bind events
				google.maps.event.addListener(this.gmap, 'dragend', this.mapPanned);
			});

		},

		initialize: function () {

			// Pass along context with each function
			_.bindAll(this, 'initializeMap', 'panMap', 'mapPanned', 'lookupAddressInfo', 'renderMarkers');

			// Local copy of the geocoder
			this._geocoder = new google.maps.Geocoder();

			// Get our local cache
			AddressListObject.fetch();

			// Listen for when the collection resets with new data
			this.listenTo(TruckListObject, 'reset', this.renderMarkers);

			google.maps.event.addDomListener(
				window,
				'load',
				this.initializeMap
			);
		}
	});

	/**
	 * The view around the results table
	 */
	var TableView = Backbone.View.extend({

		el: $('.results-table'),

		template: _.template($('#table-template').html()),

		drawTable: function () {
			// Build a json version of the collection
			var jsonList = _.map(TruckListObject.models, function (value, key, list) {
				return value.toJSON();
			});
			
			this.$el.html(this.template({listings: jsonList}));
		},

		initialize: function () {
			// Listen for when the collection resets with new data
			this.listenTo(TruckListObject, 'reset', this.drawTable);
		}
	});

	/**
	 * Main view
	 */
	var AppView = Backbone.View.extend({

		el: $('.application'),

		initialize: function () {
			this.navView = new NavView();
			this.mapView = new MapView();
			this.tableView = new TableView();

			// Bind events between views
			this.mapView.listenTo(this.navView, 'newAddress', this.mapView.panMap);
			this.navView.listenTo(this.mapView, 'mapPanned', this.navView.renderLoading);
		}
	});

	// AddressList collection
	var AddressListObject = new AddressList();
	// TruckList collection
	var TruckListObject = new TruckList();
	// Start!
	new AppView();

})();