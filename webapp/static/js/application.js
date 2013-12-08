var FoodTrucks = FoodTrucks || {};

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

					var geoResponse = new GeocodeResponse(
						results[0].geometry.location.pb,
						results[0].geometry.location.qb
					);

					addressCache[address] = geoResponse;
					FoodTrucks.LocalStorage.set('addressCache', addressCache);

					callback(geoResponse);
				}
			}
		);
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
	function initialize() {
		FoodTrucks.GoogleWrapper.callGeocodeAPI(
			'San Francisco, CA',
			function (result) {
				var mapOptions = {
					center: new google.maps.LatLng(result.lat, result.long),
					zoom: 14
				};
				var map = new google.maps.Map(
					document.getElementById("map-canvas"),
					mapOptions
				);
			}
		);
	}
	google.maps.event.addDomListener(window, 'load', initialize);
});