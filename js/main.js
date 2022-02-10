// Liste des lieux présents sur la carte englobant la france, angleterre,..
var loclarge = ["France", "Bretagne", "Finistere", "Brest", "Angleterre"];
// Liste des lieux présents sur la carte précise de guernesey et serk
var locmin = ["Saint_Pierre_Port", "Saint_Sampson", "Ruau_Petit", "Ruau_Grand", "Torteval", "Vason_Baie", "Li_Hou", "Ancresse", "Rocquaine", "Hanois", "Houmet_Paradis", "Plainmont", "Maison_visionnee"];
// Liste des lieux présents sur la carte des îles
var locmoy = ["Aurigny","Guernesey", "Jet_Hou", "Jersey", "Serk", "Herm", "Casquets", "Ecrehou", "Chousey", "Hougue_Cap", "Ortach"];
// Liste des lieux fictifs qui seront représentés en bleu
var locfic = ["Maison_visionnee"];


///// FONCTIONS /////

// Fonction qui va mettre à jour la carte contemporaine sur le nouveau lieu cliqué
// On récupère les informations du lieu, la longitude et la latitude ainsi que sur quelle carte on se trouve
// pour pouvoir manipuler le zoom en fonction de la précision du lieu
function updatemap(lon, lat, select) {
	map.addLayer(new OpenLayers.Layer.OSM());
	var lonLat = new OpenLayers.LonLat(lon,lat).transform(
        new OpenLayers.Projection("EPSG:4326"), // transformation à partir de WGS 1984
        map.getProjectionObject()
      );
	// Si on est sur un lieu précis, le zoom est différent et on ajoute une balise (marqueur)
	if (select == "svgguernesey"){
		var zoom=15;
		var markers = new OpenLayers.Layer.Markers( "Markers" );
	    map.addLayer(markers);  
	    markers.addMarker(new OpenLayers.Marker(lonLat));
	} else {
   		var zoom=12;
    }
	map.setCenter (lonLat, zoom);
}


// Fonction qui supprime une classe d'un élément et lui en rajoute une autre
function changeclass(e, del_c, new_c){
	$(e).removeClass(del_c);
	$(e).addClass(new_c);
}



///// DEBUT DU SCRIPT /////

// Par défaut l'itinéraire n'est pas visible
var showpath = false;
// Variable qui va indiquer quelle carte est actuellement visible (svgguernesey : carte de guernesey, svgisland : carte des iles, svglarge : grande carte)
var select = "";

$(document).ready(function(){

	// On affiche en premier la carte de Guernesey
    $("#loadsvg").load("svgguernesey.html #svgguernesey"); 

	// Par défaut la carte contemporaine s'affiche sur Guernesey
	map = new OpenLayers.Map("map");
	updatemap("-2.5717753724385646","49.45629750754622"); // coord de guernesey
    
    // Les autres cartes sont pour le moment cachées
    $("#map").hide();
    $("#svgisland").hide();
	$("#svglarge").hide();

	// Au chargement de la page on est sur la carte de guernesey
	select = "svgguernesey";	// var qui indique quelle carte est actuellement sélectionnée

	// Lorsqu'on clique sur un lieu dans le texte on va récupérer son lieu grace à l'attribut data-location
	$('.location').click(function() {
		var loc = $(this).attr("data-location");	// loc est le nom du lieu
		
		// Si on clique sur une location large alors on change de carte
		if (loclarge.includes(loc)) {	// on verifie si ce lieu est catégorisé comme un lieu sur la grande carte
			if ($("#map").is(':hidden')) {	// seulement si on est pas sur la carte contemporaine
				$("#svgisland").hide();
			   	$("#svglarge").show();
			   	$("#svgguernesey").hide();
			}
			select = "svglarge";

			// On regarde quel élément g a la meme datalocation
			var loc = $('g[data-location^='+loc+']');
			$(loc).each(function(index,element) {
				// on met à jour la carte contemporaine meme si elle n'est pas affichée, ce qui nous permet
				// d'avoir affiché la derniere localisation cliquée lorsqu'on veut afficher la carte contemporaine
			    updatemap($(this).attr("lon"),$(this).attr("lat"), select);
			});
						

	    // Sinon si c'est une petite localisation alors on est sur la petite carte
	    } else if (locmin.includes(loc)) {
	    	if ($("#map").is(':hidden')) {
		    	$("#svgisland").hide();
		    	$("#svglarge").hide();
		    	$("#svgguernesey").show();
		    }
			select = "svgguernesey";

			// On regarde quel élément g a la meme datalocation
			var newloc = $('g[data-location^='+loc+']');
			$(newloc).each(function(index,element) {
				// On vérifie que l'on est bien sur la carte d'Hugo et pas Openstreet map
				// et on ajoute un marqueur (drapeau) sur le lieu
				if ($("#map").is(':hidden')) {
					// Si il s'agit d'un lieu fictionnel alors le drapeau est bleu
					if (locfic.includes(loc)){
						changeclass(this, "location-flaghidden", "location-flagshowblue");
					} else {
						changeclass(this, "location-flaghidden", "location-flagshow");
					}
				}
			    updatemap($(this).attr("lon"),$(this).attr("lat"), select);
			});

	    // Sinon on affiche le bout de carte correspondant
		} else if (locmoy.includes(loc)) {
			//$("#imgguernesey").addClass("unzoom");

			if ($("#map").is(':hidden')) {
				$("#svgisland").show();
		    	$("#svgguernesey").hide();
		    	$("#svglarge").hide();
		    }
		   	select = "svgisland";
	    	
	    	// On regarde quel élément g a la meme datalocation
			var loc = $('g[data-location^='+loc+']');
			$(loc).each(function(index,element) {
				if ($("#map").is(':hidden')) {
					changeclass(this, "location-hidden", "location-show");
				    $(".location-show ellipse").fadeTo( "normal", 0 );
				    
			    }
			    updatemap($(this).attr("lon"),$(this).attr("lat"), select);
			});
		}

	});

	// Changement d'affichage entre carte contemporaine et ancienne lorsqu'on clique sur les boutons bouton1 bouton2
    $("#bouton1").click(function(){
		$("#map").hide();
		$("#"+select).show();
	});
	$("#bouton2").click(function(){
		$("#"+select).hide();
		$("#map").show();
	});


	$('#showpath').click(function() {
		
		if (showpath==false){
			$(".location-hidden").each(function(index) {
				changeclass(this, "location-hidden", "location-show");
				$(this).fadeTo( "normal", 0 );
			});
			$(".itineraire-hidden").each(function(index) {
				changeclass(this, "itineraire-hidden", "itineraire-show");
			});
			// On affiche les drapeaux de départ des itinéraires
			changeclass(".start", "location-flaghidden", "location-flagshowblue");
			changeclass(".start2", "location-flaghidden", "location-flagshowbluebig");
			//document.getElementById("bouton3").style.background="rgb(178, 21, 21, 0.8)";
			showpath = true
			document.getElementById("bouton3").style.borderRadius="10%";
		}
		else {
			$(".location-show").each(function(index) {
				changeclass(this, "location-show", "location-hidden");
				$(this).fadeTo( "normal", 0.8);
			});
			$(".itineraire-show").each(function(index) {
				changeclass(this, "itineraire-show", "itineraire-hidden");
				changeclass(".start2", "location-flagshowbluebig", "location-flaghidden");
			});
			document.getElementById("bouton3").style.borderRadius="50%";
			showpath = false
		}
	});

});
