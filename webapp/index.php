<?php

namespace FoodTrucksNearMe;

require_once(__DIR__ . '/config/config.php');

?>

<!DOCTYPE html>
<html>
<head>
	<title>Food Truck Explorer</title>
	<meta name="apple-mobile-web-app-capable" content="yes">
	<meta name="viewport" content="width=device-width, user-scalable=no">
	<link rel="stylesheet" href="//netdna.bootstrapcdn.com/bootstrap/3.0.3/css/bootstrap.min.css" />
	<link rel="stylesheet" href="static/css/style.css" />
</head>
<body>
	<div class="application">
		<div class="header">
			<div class="header-title"><?= Strings::getStringByName('title') ?></div>
			<div class="header-subtitle"><?= Strings::getStringByName('subtitle') ?></div>
			<div class="cb"></div>
		</div>
		<div class="contents">
			<div class="nav-bar">
				<div class="enter-location"></div>
				<div class="location-text">
					<input type="text" class="form-control form-override" id="address_input" placeholder="<?= Strings::getStringByName('enter_location') ?>">
					<button type="button" class="btn btn-default" id="address_submit">Search</button>
				</div>
				<div class="loading-area-and-results"></div>
				<div class="cb"></div>
			</div>
			<div id="map-canvas"></div>
			<div class="results-table"></div>
		</div>
	</div>

	<script type="text/template" id="table-template">
		<table class="table table-striped">
			<tr>
				<th><?= Strings::getStringByName('title') ?></th>
				<th><?= Strings::getStringByName('type_food') ?></th>
			</tr>
			<% _.each(listings, function (listing) { %>
			<tr>
				<td><%= listing.applicant %></td>
				<td><%= listing.fooditems %></td>
			</tr>
			<% }); %>
		</table>
	</script>

	<script type="text/javascript" src="//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>
	<script type="text/javascript" src="//netdna.bootstrapcdn.com/bootstrap/3.0.3/js/bootstrap.min.js"></script>	
	<script type="text/javascript" src="static/js/underscore-min.js"></script>
	<script type="text/javascript" src="static/js/backbone-min.js"></script>
	<script type="text/javascript" src="static/js/backbone.localStorage-min.js"></script>
 	<script type="text/javascript" src="https://maps.googleapis.com/maps/api/js?key=<?= GMAPS_API_KEY ?>&sensor=false"></script>
	<script type="text/javascript" src="static/js/backbone-app.js"></script>
	<script type="text/javascript">
		$(function() {
			if (typeof FT != 'undefined') {
				FT.Configuration.STRINGS = <?= json_encode(Strings::getAllStrings()) ?>;
			}
		});
	</script>
</body>
</html>