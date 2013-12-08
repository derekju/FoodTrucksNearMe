// TODO
// push state history for back button
// touch icon + viewport + css media for mobile browsers

var FoodTrucks = FoodTrucks || {};

/**
 * Configuration object
 */
FoodTrucks.Configuration = {
	DEFAULT_LOCATION: 'San Francisco, CA',
	DEFAULT_ZOOM: 15
};

/**
 * Wrapper for local storage
 */
FoodTrucks.LocalStorage = (function () {

	var
		me = {}
	;

	/**
	 * Retrieve from local storage with a modified key
	 */
	me.get = function (key) {
		if (window.localStorage.getObject('FoodTrucks.' + key)) {
			return window.localStorage.getObject('FoodTrucks.' + key);
		}
		return null;
	};

	/**
	 * Set to local storage with a modified key
	 */
	me.set = function (key, value) {
		key = 'FoodTrucks.' + key;
		window.localStorage.setObject(key, value);
	};

	return me;

})();

/**
 * Wrapper for Google Maps API calls
 */
FoodTrucks.GoogleWrapper = (function () {
	var
		me = {},
		_geocoder = null
	;

	function _setupAddressCache() {
		if (FoodTrucks.LocalStorage.get('addressCache') == null) {
			FoodTrucks.LocalStorage.set('addressCache', {});
		}
	}

	me.callGeocodeAPI = function (address, callback) {

		_setupAddressCache();

		var addressCache = FoodTrucks.LocalStorage.get('addressCache');
		if (addressCache &&
			_.keys(addressCache).length &&
			_.keys(addressCache).indexOf(address) != -1)
		{
			callback(addressCache[address]);
		}

		if (!_geocoder) {
			_geocoder = new google.maps.Geocoder();
		}
		_geocoder.geocode(
			{
				address: address
			},
			function (results, status) {
				if (status == google.maps.GeocoderStatus.OK) {

					var geoResponse = [
						results[0].geometry.location.pb,
						results[0].geometry.location.qb
					];

					addressCache[address] = geoResponse;
					FoodTrucks.LocalStorage.set('addressCache', addressCache);

					callback(geoResponse);
				}
			}
		);
	};

	return me;
})();

FoodTrucks.Ajax = (function () {

	var
		me = {}
	;

	me.call = function (endpoint, params, callback) {
		$.ajax({
			url: 'ajax/' + endpoint + '.php',
			data: params,
			dataType: 'json',
			type: 'POST',
			success: callback
		});
	};

	return me;

})();

/**
 * Controller for all map interactions
 */
FoodTrucks.MapController = (function () {

	var
		me = {},
		_gmap
	;

	me.init = function () {
		function initialize() {
			FoodTrucks.GoogleWrapper.callGeocodeAPI(
				FoodTrucks.Configuration.DEFAULT_LOCATION,
				function (result) {
					var mapOptions = {
						center: new google.maps.LatLng(result[0], result[1]),
						zoom: FoodTrucks.Configuration.DEFAULT_ZOOM
					};
					_gmap = new google.maps.Map(
						document.getElementById("map-canvas"),
						mapOptions
					);
				}
			);
		}
		google.maps.event.addDomListener(window, 'load', initialize);
	};

	me.panMapToNewAddress = function (address) {
		FoodTrucks.GoogleWrapper.callGeocodeAPI(
			address,
			function (geocodeResponse) {
				_gmap.panTo(new google.maps.LatLng(geocodeResponse[0], geocodeResponse[1]));

				FoodTrucks.Ajax.call(
					'get_foodtrucks',
					{
						lat: geocodeResponse[0],
						long: geocodeResponse[1]
					},
					function (resultList) {

					}
				);
			}
		);		
	};

	return me;
})();

/**
 * Controller for the nav bar
 */
FoodTrucks.NavController = (function () {

	var
		me = {}
	;

	function _submitNewAddress(address) {
		FoodTrucks.MapController.panMapToNewAddress(address);
	}

	me.init = function () {
		$('#address_input').keyup(function (e) {
			if (e.keyCode == 13) {
				_submitNewAddress(
					$('#address_input').val()
				);
			}
		});

		$('#address_submit').click(function (e) {
			_submitNewAddress(
				$('#address_input').val()
			);			
		});

		// Update view
		$('.location').text(FoodTrucks.Configuration.DEFAULT_LOCATION);
	};

	return me;

})();

Storage.prototype.setObject = function(key, value) {
	this.setItem(key, JSON.stringify(value));
}

Storage.prototype.getObject = function(key) {
	var value = this.getItem(key);
	return value && JSON.parse(value);
}

$(function () {
	FoodTrucks.NavController.init();
	FoodTrucks.MapController.init();
});