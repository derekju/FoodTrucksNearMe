// TODO
// push state history for back button
// touch icon + viewport + css media for mobile browsers
// factor out strings from this js file

var FT = FT || {};

/**
 * Configuration object
 */
FT.Configuration = {
	DEFAULT_LOCATION: 'San Francisco, CA',
	DEFAULT_ZOOM: 16
};

/**
 * Wrapper for local storage
 */
FT.LocalStorage = (function () {

	var
		me = {}
	;

	/**
	 * Retrieve from local storage with a modified key
	 */
	me.get = function (key) {
		if (window.localStorage.getObject('FT.' + key)) {
			return window.localStorage.getObject('FT.' + key);
		}
		return null;
	};

	/**
	 * Set to local storage with a modified key
	 */
	me.set = function (key, value) {
		key = 'FT.' + key;
		window.localStorage.setObject(key, value);
	};

	return me;

})();

/**
 * Wrapper for Google Maps API calls
 */
FT.GoogleWrapper = (function () {
	var
		me = {},
		_geocoder = null
	;

	/**
	 * Build the address cache if it doesn't exist
	 */
	function _setupAddressCache() {
		if (FT.LocalStorage.get('addressCache') == null) {
			FT.LocalStorage.set('addressCache', {});
		}
	}

	/**
	 * Call the google maps geocode API with a cache wrapper
	 */
	me.callGeocodeAPI = function (address, callback) {

		_setupAddressCache();

		var addressCache = FT.LocalStorage.get('addressCache');
		if (addressCache &&
			_.keys(addressCache).length &&
			_.keys(addressCache).indexOf(address) != -1)
		{
			callback(addressCache[address]);
			return;
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
						results[0].geometry.location.lat(),
						results[0].geometry.location.lng()
					];

					addressCache[address] = geoResponse;
					FT.LocalStorage.set('addressCache', addressCache);

					callback(geoResponse);
				}
			}
		);
	};

	return me;
})();

/**
 * Ajax wrapper
 */
FT.Ajax = (function () {

	var
		me = {}
	;

	/**
	 * Call an ajax endpoint with a set of parameters and a callback function
	 */
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
FT.MapController = (function () {

	var
		me = {},
		_gmap,
		_infoWindow,
		_markers
	;

	/**
	 * Initialize
	 */
	me.init = function () {
		_markers = [];

		function initialize() {
			FT.GoogleWrapper.callGeocodeAPI(
				FT.Configuration.DEFAULT_LOCATION,
				function (result) {
					var mapOptions = {
						center: new google.maps.LatLng(result[0], result[1]),
						zoom: FT.Configuration.DEFAULT_ZOOM,
						panControl: false,
						streetViewControl: false
					};
					_gmap = new google.maps.Map(
						document.getElementById("map-canvas"),
						mapOptions
					);

					// Fire initial load
					google.maps.event.addListenerOnce(_gmap, 'idle', _mapPanned);
					//_mapPanned();

					// Bind events
					google.maps.event.addListener(_gmap, 'dragend', _mapPanned);
				}
			);
		}
		google.maps.event.addDomListener(window, 'load', initialize);		
	};		

	/**
	 * Pan our map to a new address
	 */
	me.panMapToNewAddress = function (address) {
		FT.GoogleWrapper.callGeocodeAPI(
			address,
			function (geocodeResponse) {
				_gmap.panTo(new google.maps.LatLng(geocodeResponse[0], geocodeResponse[1]));
				// Calling manually instead of binding to idle event due to complications from
				// clicking on markers causing the map to auto pan
				_mapPanned(); 
			}
		);		
	};

	/**
	 * Callback for when the map has just been panned
	 */
	function _mapPanned() {

		// Remove all old markers and reset state
		_infoWindow = null;
		_.each(_markers, function (element, index, list) {
			element.setMap(null);
		});

		// Display loader
		$('.loading-area-and-results').html(
			'<img src="static/images/ajax-loader.gif" /><span>' + FT.Configuration.STRINGS.loading + '</span>'
		);

		// TODO: Put limiter on this to prevent unlimited spammy calls
		// Say, call once every 500ms of idling?
		FT.Ajax.call(
			'get_foodtrucks',
			{
				neLat: _gmap.getBounds().getNorthEast().lat(),
				neLng: _gmap.getBounds().getNorthEast().lng(),
				swLat: _gmap.getBounds().getSouthWest().lat(),
				swLng: _gmap.getBounds().getSouthWest().lng()
			},
			function (resultList) {

				if (resultList.length == 1) {
					$('.loading-area-and-results').text(resultList.length + ' ' + FT.Configuration.STRINGS.result);
				} else {
					$('.loading-area-and-results').text(resultList.length + ' ' + FT.Configuration.STRINGS.results);
				}

				FT.ResultsTableController.setupTable();

				_.each(resultList, function (element, index, list) {
					var infoWindow = new google.maps.InfoWindow({
						content: element.applicant
					});

					var marker = new google.maps.Marker({
						position: new google.maps.LatLng(element.latitude, element.longitude),
						map: _gmap,
						title: element.applicant
					});
					_markers.push(marker);

					google.maps.event.addListener(marker, 'click', function() {
						if (_infoWindow) {
							_infoWindow.close();
						}
						_infoWindow = infoWindow;
						_infoWindow.open(_gmap, marker);
					});

					FT.ResultsTableController.appendEntryToTable(element);
				});
			}
		);
	}

	return me;
})();

/**
 * Controller for the nav bar
 */
FT.NavController = (function () {

	var
		me = {}
	;

	function _submitNewAddress(address) {
		FT.MapController.panMapToNewAddress(address);
	}

	me.init = function () {

		$('#address_input').val(
			FT.Configuration.DEFAULT_LOCATION
		);

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
	};

	return me;

})();

FT.ResultsTableController = (function () {

	var
		me = {},
		_$node
	;

	me.init = function () {
		_$node = $('.results-table');
	};

	me.setupTable = function () {
		// Destroy what was there before
		_$node.html('');

		_$node.html(
			'<table class="table table-striped">' +
				'<tr>' +
					'<th>' + FT.Configuration.STRINGS.name + '</th>' +
					'<th>' + FT.Configuration.STRINGS.type_food + '</th>' +
				'</tr>' +
			'</table>'
		);
	};

	me.appendEntryToTable = function (entry) {
		_$node.find('table').append(
			'<tr>' +
				'<td>' + entry.applicant + '</td>' +
				'<td>' + entry.fooditems + '</td>' +
			'</tr>'
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
	_.each(
		['NavController', 'MapController', 'ResultsTableController'],
		function (element, index, list) {
			FT[element].init();
		}
	);
});