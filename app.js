/* ===============================
   SUPERFICIAL PROTECTIONS (DETERRENTS)
   NOTE: These only deter casual users. They do NOT prevent motivated users
   from viewing or saving the JavaScript. For real protection, move secrets
   to server-side code and/or obfuscate the bundle before publishing.
   =============================== */
(function() {
  // Disable right-click context menu
  document.addEventListener('contextmenu', function(e) { e.preventDefault(); });

  // Block common devtools shortcuts (F12, Ctrl+Shift+I/C/J, Ctrl+U). Not secure.
  document.addEventListener('keydown', function(e) {
    try {
      var key = e.key || String.fromCharCode(e.keyCode || e.which);
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.key && e.key.toLowerCase() === 'u') ||
        (e.ctrlKey && e.shiftKey && e.key && ['i','j','c'].includes(e.key.toLowerCase()))
      ) {
        e.preventDefault(); e.stopPropagation();
        if (typeof showToast === 'function') {
          try { showToast('Action disabled', 'error', 1200); } catch (e) { /* ignore */ }
        }
      }
    } catch (err) { /* defensive */ }
  }, true);
})();

/* ===============================
   TOAST NOTIFICATION SYSTEM
   =============================== */
function showToast(message, type = 'info', duration = 3000) {
  var container = document.getElementById('toastContainer');
  var toast = document.createElement('div');
  toast.className = 'toast ' + type;
  var icons = { info: 'fa-circle-info', success: 'fa-circle-check', error: 'fa-circle-exclamation' };
  toast.innerHTML = '<i class="fa-solid ' + (icons[type] || icons.info) + '"></i> ' + message;
  container.appendChild(toast);
  setTimeout(function() {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    setTimeout(function() { toast.remove(); }, 300);
  }, duration);
}

/* ===============================
   LOADING OVERLAY
   =============================== */
function showLoading() {
  document.getElementById('loadingOverlay').classList.add('active');
}

function hideLoading() {
  document.getElementById('loadingOverlay').classList.remove('active');
}

/* ===============================
   SIDEBAR TOGGLE
   =============================== */
var sidebar = document.getElementById('sidebar');
var sidebarToggle = document.getElementById('sidebarToggle');
var sidebarClose = document.getElementById('sidebarClose');

function toggleSidebar() {
  sidebar.classList.toggle('collapsed');
}

sidebarToggle.addEventListener('click', toggleSidebar);
sidebarClose.addEventListener('click', function() {
  sidebar.classList.add('collapsed');
});

/* ===============================
   ACCORDION SECTIONS
   =============================== */
document.querySelectorAll('.layer-section-header').forEach(function(header) {
  header.addEventListener('click', function() {
    var section = this.parentElement;
    var isOpen = section.classList.contains('open');

    // Close all sections
    document.querySelectorAll('.layer-section').forEach(function(s) {
      s.classList.remove('open');
      s.querySelector('.layer-section-header').setAttribute('aria-expanded', 'false');
    });

    // Open clicked section if it was closed
    if (!isOpen) {
      section.classList.add('open');
      this.setAttribute('aria-expanded', 'true');
    }
  });

  // Keyboard support
  header.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this.click();
    }
  });
});

/* ===============================
   SEARCH FUNCTIONALITY
   =============================== */
var searchData = [
  { name: 'Google Hybrid (Basemap)', type: 'basemap', action: function() { document.querySelector('input[name="basemap"][value="googleHybrid"]').checked = true; document.querySelector('input[name="basemap"][value="googleHybrid"]').dispatchEvent(new Event('change')); } },
  { name: 'Google Streets (Basemap)', type: 'basemap', action: function() { document.querySelector('input[name="basemap"][value="googleStreets"]').checked = true; document.querySelector('input[name="basemap"][value="googleStreets"]').dispatchEvent(new Event('change')); } },
  { name: 'Satellite Esri (Basemap)', type: 'basemap', action: function() { document.querySelector('input[name="basemap"][value="satellite"]').checked = true; document.querySelector('input[name="basemap"][value="satellite"]').dispatchEvent(new Event('change')); } },
  { name: 'OpenStreetMap (Basemap)', type: 'basemap', action: function() { document.querySelector('input[name="basemap"][value="osm"]').checked = true; document.querySelector('input[name="basemap"][value="osm"]').dispatchEvent(new Event('change')); } },
  { name: 'Dark Map (Basemap)', type: 'basemap', action: function() { document.querySelector('input[name="basemap"][value="dark"]').checked = true; document.querySelector('input[name="basemap"][value="dark"]').dispatchEvent(new Event('change')); } },
  { name: 'Division Boundary', type: 'boundary', action: function() { toggleLayer(divisionLayer, true); document.getElementById('chkDivision').checked = true; } },
  { name: 'Range Boundary', type: 'boundary', action: function() { toggleLayer(rangeLayer, true); document.getElementById('chkRange').checked = true; } },
  { name: 'Round Boundary', type: 'boundary', action: function() { toggleLayer(roundLayer, true); document.getElementById('chkRound').checked = true; } },
  { name: 'Beat Boundary', type: 'boundary', action: function() { toggleLayer(beatLayer, true); document.getElementById('chkBeat').checked = true; } },
  { name: 'Compartment Boundary', type: 'boundary', action: function() { toggleLayer(compartmentLayer, true); document.getElementById('chkCompartment').checked = true; } },
  { name: 'Village Boundary', type: 'boundary', action: function() { toggleLayer(villageLayer, true); document.getElementById('chkVillage').checked = true; } },
  { name: 'Fire Watch Tower', type: 'point', action: function() { toggleLayer(firewatchtowerLayer, true); document.getElementById('chkFirewatchtower').checked = true; } },
  { name: 'Waterbody', type: 'water', action: function() { document.getElementById('poiSelect').value = 'waterbody'; loadPoiLayer(); } },
  { name: 'Stream Network', type: 'water', action: function() { document.getElementById('poiSelect').value = 'streamNetwork'; loadPoiLayer(); } },
  { name: 'NDVI', type: 'dynamic', action: function() { document.getElementById('geeSelect').value = 'ndvi'; openGEE(); } },
  { name: 'Rainfall', type: 'dynamic', action: function() { document.getElementById('geeSelect').value = 'rainfall'; openGEE(); } },
  { name: 'Temperature', type: 'dynamic', action: function() { document.getElementById('geeSelect').value = 'temperature'; openGEE(); } },
  { name: 'Land Use Land Cover', type: 'dynamic', action: function() { document.getElementById('geeSelect').value = 'lulc'; openGEE(); } },
  { name: 'Soil Depth', type: 'soil', action: function() { document.getElementById('staticSelect').value = 'Soil_Depth'; loadStaticLayer(); } },
  { name: 'Soil Erosion', type: 'soil', action: function() { document.getElementById('staticSelect').value = 'Soil_Erosion'; loadStaticLayer(); } },
  { name: 'FDCM Boundary', type: 'wildlife', action: function() { document.getElementById('otherSelect').value = 'fdcm'; loadOtherLayer(); } },
  { name: 'Kanhargaon WLS', type: 'wildlife', action: function() { document.getElementById('otherSelect').value = 'kanhargaon'; loadOtherLayer(); } },
  { name: 'Range Office', type: 'office', action: function() { document.getElementById('officeSelect').value = 'rangeoffice'; loadOfficeLayer(); } },
  { name: 'Jogapur Safari', type: 'safari', action: function() { document.getElementById('safariSelect').value = 'jogapur'; loadSafariLayer(); } },
  { name: 'Karwa Safari', type: 'safari', action: function() { document.getElementById('safariSelect').value = 'karwa'; loadSafariLayer(); } }
];

var searchInput = document.getElementById('searchInput');
var searchResults = document.getElementById('searchResults');

searchInput.addEventListener('input', function() {
  var query = this.value.trim().toLowerCase();
  searchResults.innerHTML = '';

  if (query.length < 2) {
    searchResults.classList.remove('active');
    return;
  }

  var matches = searchData.filter(function(item) {
    return item.name.toLowerCase().includes(query);
  });

  if (matches.length === 0) {
    searchResults.innerHTML = '<div class="search-result-item" style="color: var(--text-muted);"><i class="fa-solid fa-circle-xmark"></i> No results found</div>';
  } else {
    matches.forEach(function(item) {
      var typeIcons = { boundary: 'fa-draw-polygon', point: 'fa-map-marker-alt', water: 'fa-tint', dynamic: 'fa-satellite', soil: 'fa-mountain', wildlife: 'fa-paw', office: 'fa-building', safari: 'fa-binoculars', basemap: 'fa-map' };
      var div = document.createElement('div');
      div.className = 'search-result-item';
      div.innerHTML = '<i class="fa-solid ' + (typeIcons[item.type] || 'fa-search') + '"></i> ' + item.name;
      div.addEventListener('click', function() {
        item.action();
        searchResults.classList.remove('active');
        searchInput.value = '';
        showToast('Layer loaded: ' + item.name, 'success');
      });
      searchResults.appendChild(div);
    });
  }

  searchResults.classList.add('active');
});

searchInput.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    searchResults.classList.remove('active');
    searchInput.blur();
  }
});

// Close search results on outside click
document.addEventListener('click', function(e) {
  if (!e.target.closest('.search-bar')) {
    searchResults.classList.remove('active');
  }
});

/* ===============================
   PANEL TOGGLE LOGIC
   =============================== */
function toggleUIPanel(panelId, isChecked) {
  /* Only toggle the measurePanel - dropdown panels are now inside
     accordion sections and their visibility is handled by the accordion */
  var el = document.getElementById(panelId);
  if (!el) return;

  if (isChecked) {
    el.style.display = 'block';
  } else {
    el.style.display = 'none';
    if (panelId === 'measurePanel' && typeof stopMeasure === 'function') stopMeasure();
  }
}

/* ===============================
   MAP INITIALIZATION
   =============================== */
var map = L.map('map', {
  zoomControl: false,
  attributionControl: false
}).setView([19.732932, 79.399750], 10);

/* ===============================
   ZOOM CONTROL (right side)
   =============================== */
/* Zoom control removed - use scroll wheel, pinch, or floating buttons instead */

/* ===============================
   SCALE BAR
   =============================== */
L.control.scale({
  position: 'bottomleft',
  imperial: false,
  maxWidth: 200
}).addTo(map);

/* ===============================
   BASEMAPS
   =============================== */
var osmMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors',
  maxZoom: 19
});

var darkMap = L.tileLayer(
  'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  { attribution: '&copy; CARTO', maxZoom: 19 }
);

var satelliteMap = L.tileLayer(
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  { attribution: '&copy; Esri', maxZoom: 19 }
);

var googleStreets = L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
  maxZoom: 20,
  subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
});

var googleHybrid = L.tileLayer('https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', {
  maxZoom: 20,
  subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
}).addTo(map);

/* Helper: DMS conversion (used by point info popup) */
function toDMS(deg, isLat) {
  var dir = isLat ? (deg >= 0 ? 'N' : 'S') : (deg >= 0 ? 'E' : 'W');
  deg = Math.abs(deg);
  var d = Math.floor(deg);
  var m = Math.floor((deg - d) * 60);
  var s = ((deg - d - m / 60) * 3600).toFixed(1);
  return d + '\u00B0' + m + "'" + s + '"' + dir;
}

/* ===============================
   LAYER GROUPS
   =============================== */
var divisionLayer = L.featureGroup();
var rangeLayer = L.featureGroup();
var roundLayer = L.featureGroup();
var beatLayer = L.featureGroup();
var compartmentLayer = L.featureGroup();
var waterbodyLayer = L.featureGroup();
var streamNetworkLayer = L.featureGroup();
var villageLayer = L.featureGroup();
var firewatchtowerLayer = L.featureGroup();
var fdcmLayer = L.featureGroup();
var kanhargaonWlsLayer = L.featureGroup();
var soilDepthLayer = L.featureGroup();
var soilErosionLayer = L.featureGroup();
var soilSlopeLayer = L.featureGroup();
var soilProductivityLayer = L.featureGroup();
var soilTextureLayer = L.featureGroup();
var rangeofficeLayer = L.featureGroup();
var roundofficeLayer = L.featureGroup();
var restHouseLayer = L.featureGroup();
var jogapursafariLayer = L.featureGroup();
var karwasafariLayer = L.featureGroup();
var iwcLayer = L.featureGroup();
var fwcLayer = L.featureGroup();
var sciLayer = L.featureGroup();
var otplLayer = L.featureGroup();

var streamOrderColors = {
  1: '#1f78b4', 2: '#33a02c', 3: '#ff7f00',
  4: '#e31a1c', 5: '#6a3d9a', 6: '#b15928', 7: '#17becf'
};

var soilStyleConfig = {
  "Soil Depth": {
    prop: "class",
    colors: {
      "Extremely shallow (< 10cm)": "#d73027",
      "Very shallow (10-25 cm)": "#fc8d59",
      "Shallow (25-50cm)": "#fee08b",
      "Deep,Moderately deep, slightly/moderately shallow (depth>50cm)": "#38a800"
    },
    defaultColor: "#f4a261"
  },
  "Soil Erosion": {
    prop: "descr",
    colors: {
      "Very severe, gullied": "#b10026", "Severe": "#e31a1c",
      "Moderate": "#fc8d59", "Slight": "#fdbb84", "Very slight": "#fed976"
    },
    defaultColor: "#fd8d3c"
  },
  "Soil Slope": {
    prop: "descr",
    colors: {
      "Level to very gently sl": "#ffffcc", "Gently sloping": "#a1dab4",
      "Moderately sloping": "#41b6c4", "Strongly sloping": "#2c7fb8",
      "Steeply sloping": "#253494"
    },
    defaultColor: "#74add1"
  },
  "Soil Productivity": {
    prop: "prod_class",
    colors: {
      "NON PRODUCTIVE": "#d73027", "LOW PRODUCTIVE": "#fc8d59",
      "MODERATELY LOW PRODUCTIVE": "#fee08b", "MODERATELY PRODUCTIVE": "#91cf60",
      "HIGHLY PRODUCTIVE": "#1a9850"
    },
    defaultColor: "#66c2a5"
  },
  "Soil Texture": {
    prop: "descr",
    colors: {
      "Fine texture": "#4575b4", "2. Medium texture": "#74add1",
      "Rocky and non soil": "#fdae61"
    },
    defaultColor: "#74a9cf"
  }
};

/* ===============================
   PROJECTION (UTM)
   =============================== */
proj4.defs("EPSG:32644", "+proj=utm +zone=44 +datum=WGS84 +units=m +no_defs");
proj4.defs("EPSG:32643", "+proj=utm +zone=43 +datum=WGS84 +units=m +no_defs");

/* ===============================
   BOUNDARY LAYER LOADER
   =============================== */
function loadBoundaryLayer(url, layerGroup, color, nameProp, labelTitle, isUTM, srcCrs, fillOpacity, showAllAttributes, labelPredicate) {
  isUTM = isUTM !== undefined ? isUTM : true;
  srcCrs = srcCrs || "EPSG:32644";
  fillOpacity = fillOpacity || 0.0;
  showAllAttributes = showAllAttributes || false;

  showLoading();

  fetch(encodeURI(url))
    .then(function(response) {
      if (!response.ok) throw new Error("HTTP " + response.status);
      return response.json();
    })
    .then(function(data) {
      if (isUTM) {
        data.features.forEach(function(feature) {
          if (feature.geometry.type === "MultiPolygon") {
            feature.geometry.coordinates.forEach(function(polygon) {
              polygon.forEach(function(ring) {
                ring.forEach(function(coord) {
                  var t = proj4(srcCrs, "WGS84", coord);
                  coord[0] = t[0]; coord[1] = t[1];
                });
              });
            });
          } else if (feature.geometry.type === "Polygon") {
            feature.geometry.coordinates.forEach(function(ring) {
              ring.forEach(function(coord) {
                var t = proj4(srcCrs, "WGS84", coord);
                coord[0] = t[0]; coord[1] = t[1];
              });
            });
          }
        });
      }

      var geoJson = L.geoJSON(data, {
        style: function(feature) {
          if (labelTitle === "Stream Network" && feature && feature.properties && feature.properties.ORD_STRA != null) {
            return { color: streamOrderColors[feature.properties.ORD_STRA] || '#00bfff', weight: 3, opacity: 0.9 };
          }
          var soilConfig = soilStyleConfig[labelTitle];
          if (soilConfig && feature && feature.properties) {
            var value = feature.properties[soilConfig.prop];
            var fillColor = soilConfig.colors[value] || soilConfig.defaultColor || color;
            return { color: fillColor, weight: 1.5, fillOpacity: fillOpacity, fillColor: fillColor };
          }
          return { color: color, weight: 2, fillOpacity: fillOpacity, fillColor: color };
        },
        onEachFeature: function(feature, layer) {
          function buildAttributesTable(props) {
            if (!props) return '<div>No attributes</div>';
            var content = '<div style="max-height:300px;overflow-y:auto;"><table class="attr-table" border="0" style="border-collapse:collapse;width:100%;font-size:12px;">';
            for (var key in props) {
              content += '<tr><td>' + key + '</td><td>' + props[key] + '</td></tr>';
            }
            content += '</table></div>';
            return content;
          }

          if (showAllAttributes && feature.properties) {
            layer.bindPopup(buildAttributesTable(feature.properties));
          } else {
            var displayName = feature.properties && feature.properties[nameProp] ? feature.properties[nameProp] : '';
            layer.bindPopup('<div class="attr-box"><b>' + labelTitle + ':</b> ' + displayName + '</div>');
          }

          layer.on('click', function(e) {
            if (typeof measureActive !== 'undefined' && measureActive) {
              handleMeasureClick(e);
              return;
            }
          });

          // Hover effects for boundaries
          layer.on('mouseover', function() {
            if (!measureActive) this.setStyle({ weight: 3, fillOpacity: Math.max(fillOpacity, 0.15) });
          });
          layer.on('mouseout', function() {
            geoJson.resetStyle(this);
          });
        }
      });

      layerGroup.addLayer(geoJson);

      // Add labels
      geoJson.eachLayer(function(layer) {
        try {
          var center = null;
          if (typeof layer.getBounds === 'function') {
            var b = layer.getBounds();
            if (b && typeof b.isValid === 'function' && b.isValid() && typeof b.getCenter === 'function') center = b.getCenter();
          }
          if (!center && typeof layer.getLatLng === 'function') center = layer.getLatLng();
          if (!center && layer.feature && layer.feature.geometry) {
            var geom = layer.feature.geometry;
            var coords = [];
            if (geom.type === 'Polygon') coords = geom.coordinates[0] || [];
            else if (geom.type === 'MultiPolygon') coords = (geom.coordinates[0] && geom.coordinates[0][0]) || [];
            if (coords.length) {
              var sx = 0, sy = 0;
              coords.forEach(function(c) { sx += c[0]; sy += c[1]; });
              center = L.latLng(sy / coords.length, sx / coords.length);
            }
          }
          if (!center) return;

          var name = (layer.feature && layer.feature.properties) ? layer.feature.properties[nameProp] : null;
          if (!name) return;
          if (typeof labelPredicate === 'function') {
            try { if (!labelPredicate(layer.feature.properties || {})) return; } catch (e) { return; }
          }

          L.marker(center, {
            icon: L.divIcon({ className: 'range-label', html: name, iconSize: [60, 10], iconAnchor: [30, 5] })
          }).addTo(layerGroup);
        } catch (e) {
          console.warn('Skipping label:', e);
        }
      });

      if (labelTitle === "Round Boundary") {
        map.fitBounds(geoJson.getBounds().pad(0.1));
      }

      hideLoading();
    })
    .catch(function(err) {
      console.error("Error loading " + labelTitle, err);
      hideLoading();
      showToast('Failed to load ' + labelTitle + ': ' + err.message, 'error');
    });
}

/* ===============================
   POINT LAYER LOADER
   =============================== */
function loadPointLayer(url, layerGroup, iconHtml, nameProp, labelTitle, isUTM) {
  isUTM = isUTM !== undefined ? isUTM : true;

  return fetch(encodeURI(url))
    .then(function(response) { if (!response.ok) throw new Error("HTTP " + response.status); return response.json(); })
    .then(function(data) {
      data.features.forEach(function(feature) {
        if (!feature.geometry) return;
        var coords = feature.geometry.coordinates;
        if (isUTM && coords && feature.geometry.type === 'Point') {
          var t = proj4("EPSG:32644", "WGS84", coords);
          coords = [t[0], t[1]];
        }

        function createMarker(latlng, feature) {
          var marker = L.marker(latlng, {
            icon: L.divIcon({ className: 'range-office-icon', html: iconHtml, iconSize: [28, 28], iconAnchor: [14, 14] })
          });
          var popupContent = feature.properties && feature.properties[nameProp]
            ? '<div class="attr-box"><b>' + labelTitle + ':</b> ' + feature.properties[nameProp] + '</div>'
            : '';
          if (popupContent) marker.bindPopup(popupContent);
          marker.on('click', function(e) {
            if (typeof measureActive !== 'undefined' && measureActive) handleMeasureClick(e);
          });
          layerGroup.addLayer(marker);
        }

        if (feature.geometry.type === 'Point') {
          createMarker([coords[1], coords[0]], feature);
        } else if (feature.geometry.type === 'MultiPoint') {
          feature.geometry.coordinates.forEach(function(c) {
            var use = c;
            if (isUTM) { var t = proj4("EPSG:32644", "WGS84", c); use = [t[0], t[1]]; }
            createMarker([use[1], use[0]], feature);
          });
        }
      });
    })
    .catch(function(err) {
      console.error("Error loading " + labelTitle, err);
      showToast('Failed to load ' + labelTitle + ': ' + err.message, 'error');
    });
}

// Load all layers
loadBoundaryLayer("Division_outer.geojson", divisionLayer, "cyan", "Division_N", "Division Boundary");
loadBoundaryLayer("Range_Json.geojson", rangeLayer, "#2196F3", "Range_Name", "Range Boundary");
loadBoundaryLayer("Round_File.geojson", roundLayer, "#9C27B0", "Round_Name", "Round Boundary");
loadBoundaryLayer("Beat_Boundary.geojson", beatLayer, "#333", "Beat_Name", "Beat Boundary");
loadBoundaryLayer("Comparment_Modify1.geojson", compartmentLayer, "#F44336", "Old_ComptN", "Compartment Boundary", true, undefined, undefined, true);
loadBoundaryLayer("Village_file_1.geojson", villageLayer, "#FF9800", "Name", "Village Boundary");
loadBoundaryLayer("firewatchtower.geojson", firewatchtowerLayer, "#000", "Name", "Fire Watch Tower");
loadBoundaryLayer("Jogapur_Safari_Route.geojson", jogapursafariLayer, "#E91E63", "Name", "Jogapur Safari");
loadBoundaryLayer("karwa_Safari_Route_Demo.geojson", karwasafariLayer, "#E91E63", "Name", "karwa Safari");
loadBoundaryLayer("FDCM.geojson", fdcmLayer, "#795548", "FDCM", "FDCM Boundary", true);
loadBoundaryLayer("Kanhargaon WLS.geojson", kanhargaonWlsLayer, "#4CAF50", "Name", "Kanhargaon WLS");
loadBoundaryLayer("Stream_Network.geojson", streamNetworkLayer, "deepskyblue", "ORD_STRA", "Stream Network");

loadPointLayer("Waterbody_cc.geojson", waterbodyLayer, '<span>\uD83D\uDCA7</span>', "Attribute", "Waterbody", true);
loadPointLayer("Range office Headquarters.geojson", rangeofficeLayer, '<span>\uD83C\uDFDB\uFE0F</span>', "Attribute", "Range Office Headquarters", true);
loadPointLayer("Round_Office_Headquarters.sbx.geojson", roundofficeLayer, '<span>\uD83C\uDFE5</span>', "Attribute", "Round Office", true);
loadPointLayer("Rest House.geojson", restHouseLayer, '<span>\uD83C\uDFE8</span>', "Attribute", "Rest House", true);

/* ===============================
   ZOOM TO VISIBLE LAYERS
   =============================== */
function zoomToVisibleLayers() {
  var visibleBounds = L.latLngBounds([]);
  var layerGroups = [divisionLayer, rangeLayer, roundLayer, beatLayer, compartmentLayer, waterbodyLayer, streamNetworkLayer, villageLayer, soilDepthLayer, soilErosionLayer, soilSlopeLayer, soilProductivityLayer, soilTextureLayer, restHouseLayer, jogapursafariLayer, karwasafariLayer, fdcmLayer, kanhargaonWlsLayer];
  layerGroups.forEach(function(lg) {
    if (map.hasLayer(lg) && lg.getLayers().length > 0) {
      visibleBounds.extend(lg.getBounds());
    }
  });
  if (visibleBounds.isValid()) map.fitBounds(visibleBounds.pad(0.1));
}

/* ===============================
   TOGGLE LAYER
   =============================== */
function toggleLayer(layer, isChecked) {
  if (isChecked) {
    map.addLayer(layer);
    if (layer.getLayers().length > 0) {
      zoomToVisibleLayers();
    } else {
      layer.once('layeradd', function() { zoomToVisibleLayers(); });
    }
    showToast('Layer enabled', 'success', 1500);
  } else {
    map.removeLayer(layer);
    zoomToVisibleLayers();
  }
  updateLegend();
}

/* ===============================
   LEGEND
   =============================== */
var legendItems = [
  { layer: divisionLayer, color: "cyan", label: "Division Boundary" },
  { layer: rangeLayer, color: "#2196F3", label: "Range Boundary" },
  { layer: roundLayer, color: "#9C27B0", label: "Round Boundary" },
  { layer: beatLayer, color: "#333", label: "Beat Boundary" },
  { layer: compartmentLayer, color: "#F44336", label: "Compartment Boundary" },
  { layer: villageLayer, color: "#FF9800", label: "Village Boundary" },
  { layer: waterbodyLayer, iconHtml: '<span class="waterbody-icon">\uD83D\uDCA7</span>', label: "Waterbody" },
  { layer: streamNetworkLayer, color: "deepskyblue", label: "Stream Network" },
  { layer: rangeofficeLayer, iconHtml: '<span class="range-office-icon">\uD83C\uDFDB\uFE0F</span>', label: "Range Office" },
  { layer: roundofficeLayer, iconHtml: '<span class="round-office-icon">\uD83C\uDFE5</span>', label: "Round Office" },
  { layer: restHouseLayer, iconHtml: '<span class="rest-house-icon">\uD83C\uDFE8</span>', label: "Rest House" },
  { layer: firewatchtowerLayer, iconHtml: '<span style="font-size:14px;">\uD83D\uDD25</span>', label: "Fire Watch Tower" },
  { layer: jogapursafariLayer, color: "#E91E63", label: "Tiger Safari" },
  { layer: fdcmLayer, color: "#795548", label: "FDCM Boundary" },
  { layer: kanhargaonWlsLayer, color: "#4CAF50", label: "Kanhargaon WLS" },
  { layer: soilDepthLayer, color: "#a96f2b", label: "Soil Depth" },
  { layer: soilErosionLayer, color: "#9c5d3d", label: "Soil Erosion" },
  { layer: soilSlopeLayer, color: "#7a9a4c", label: "Soil Slope" },
  { layer: soilProductivityLayer, color: "#4e7a53", label: "Soil Productivity" },
  { layer: soilTextureLayer, color: "#55778e", label: "Soil Texture" },
  { layer: iwcLayer, color: "#1f77b4", label: "IWC Plantation" },
  { layer: fwcLayer, color: "#ff7f0e", label: "FWC Plantation" },
  { layer: sciLayer, color: "#2ca02c", label: "SCI Plantation" },
  { layer: otplLayer, color: "#d62728", label: "OTPL Plantation" }
];

var legend = L.control({ position: "bottomright" });
legend.onAdd = function(map) {
  var div = L.DomUtil.create("div", "legend");
  div.id = 'layerLegend';
  updateLegend();
  return div;
};

function updateLegend() {
  var legendDiv = document.getElementById('layerLegend');
  if (!legendDiv) return;

  function collectStreamOrders(layer, orders) {
    if (layer.feature && layer.feature.properties && layer.feature.properties.ORD_STRA != null) orders.add(layer.feature.properties.ORD_STRA);
    if (layer.eachLayer) layer.eachLayer(function(child) { if (child !== layer) collectStreamOrders(child, orders); });
  }

  function collectSoilCategories(layer, prop, categories) {
    if (layer.feature && layer.feature.properties && layer.feature.properties[prop] != null) categories.add(layer.feature.properties[prop]);
    if (layer.eachLayer) layer.eachLayer(function(child) { if (child !== layer) collectSoilCategories(child, prop, categories); });
  }

  var html = '<div class="legend-title"><i class="fa-solid fa-list"></i> Legend</div>';
  var hasItems = false;

  legendItems.forEach(function(item) {
    if (!map.hasLayer(item.layer)) return;
    hasItems = true;

    if (item.layer === streamNetworkLayer) {
      var orders = new Set();
      collectStreamOrders(item.layer, orders);
      if (orders.size > 0) {
        html += '<div class="legend-group-title">' + item.label + '</div>';
        Array.from(orders).sort().forEach(function(order) {
          var color = streamOrderColors[order] || '#00bfff';
          html += '<div class="legend-item"><div class="legend-symbol" style="background:' + color + ';"></div><span>Order ' + order + '</span></div>';
        });
        return;
      }
    }

    var soilConfig = soilStyleConfig[item.label];
    if (soilConfig) {
      var categories = new Set();
      collectSoilCategories(item.layer, soilConfig.prop, categories);
      if (categories.size > 0) {
        html += '<div class="legend-group-title">' + item.label + '</div>';
        Array.from(categories).sort().forEach(function(value) {
          var color = soilConfig.colors[value] || soilConfig.defaultColor || item.color || 'gray';
          html += '<div class="legend-item"><div class="legend-symbol" style="background:' + color + ';"></div><span style="font-size:11px;">' + value + '</span></div>';
        });
        return;
      }
    }

    var symbol = '';
    if (item.iconHtml) {
      symbol = '<div class="legend-symbol" style="background:transparent;border:none;">' + item.iconHtml + '</div>';
    } else {
      symbol = '<div class="legend-symbol" style="background:' + (item.color || 'transparent') + ';"></div>';
    }
    html += '<div class="legend-item">' + symbol + '<span>' + item.label + '</span></div>';
  });

  if (!hasItems) html += '<div style="font-size:12px;color:var(--text-muted);">No visible layers</div>';
  legendDiv.innerHTML = html;
}

legend.addTo(map);

// Apply initial layer visibility
(function applyInitialLayerVisibility() {
  var layerMap = {
    chkDivision: divisionLayer, chkRange: rangeLayer, chkRound: roundLayer,
    chkBeat: beatLayer, chkCompartment: compartmentLayer, chkVillage: villageLayer,
    chkFirewatchtower: firewatchtowerLayer
  };
  Object.keys(layerMap).forEach(function(cbId) {
    var cb = document.getElementById(cbId);
    if (cb && cb.checked) map.addLayer(layerMap[cbId]);
  });
  updateLegend();
})();

/* ===============================
   MEASUREMENT TOOL
   =============================== */
var measureMode = 'line';
var measureActive = false;
var measureLayer = L.featureGroup().addTo(map);
var importedLayer = L.featureGroup().addTo(map);
var measureMarkers = [];
var measureLine = null;
var measurePolygon = null;
var measureCircle = null;
var measureCircleMarker = null;
var measureCircleRadiusLine = null;
var measureCircleCenter = null;
var userCoordinateMarker = null;

function toRad(deg) { return deg * Math.PI / 180; }

function parseDMS(input) {
  if (!input) return null;
  var cleaned = input.trim().replace(/[\u00B0\u00BA]/g, ' ').replace(/["']/g, ' ').replace(/[^0-9NSEWnsew.\s-]/g, ' ').trim();
  var parts = cleaned.split(/\s+/);
  if (parts.length === 0) return null;
  var sign = 1;
  var last = parts[parts.length - 1].toUpperCase();
  if (last === 'N' || last === 'S' || last === 'E' || last === 'W') {
    if (last === 'S' || last === 'W') sign = -1;
    parts.pop();
  }
  var deg = parseFloat(parts[0]);
  if (isNaN(deg)) return null;
  var min = parts.length > 1 ? parseFloat(parts[1]) : 0;
  var sec = parts.length > 2 ? parseFloat(parts[2]) : 0;
  if (isNaN(min)) min = 0;
  if (isNaN(sec)) sec = 0;
  return sign * (Math.abs(deg) + (min / 60) + (sec / 3600));
}

function toggleCoordinateInputPanel(show) {
  var panel = document.getElementById('coordInputPanel');
  if (panel) panel.style.display = show ? 'flex' : 'none';
  if (show) document.getElementById('coordinateInputLat').focus();
}

function plotUserCoordinate() {
  var lat = parseDMS(document.getElementById('coordinateInputLat').value);
  var lng = parseDMS(document.getElementById('coordinateInputLng').value);
  if (lat === null || lng === null || isNaN(lat) || isNaN(lng)) {
    showToast('Please enter valid DMS or decimal coordinates.', 'error');
    return;
  }
  if (userCoordinateMarker) measureLayer.removeLayer(userCoordinateMarker);
  userCoordinateMarker = L.marker([lat, lng], {
    icon: L.icon({ iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png', iconSize: [25, 41], iconAnchor: [12, 41] })
  }).addTo(measureLayer).bindPopup('Coordinate: ' + lat.toFixed(6) + ', ' + lng.toFixed(6));
  map.setView([lat, lng], 15);
  toggleCoordinateInputPanel(false);
  showToast('Plotted: ' + lat.toFixed(6) + ', ' + lng.toFixed(6), 'success');
  showPointInfoPopup(L.latLng(lat, lng), 1);
}

function formatDistance(meters) {
  return meters >= 1000 ? (meters / 1000).toFixed(2) + ' km' : meters.toFixed(1) + ' m';
}

function formatArea(sq) {
  if (sq >= 1000000) return (sq / 1000000).toFixed(3) + ' km\u00B2';
  if (sq >= 10000) return (sq / 10000).toFixed(2) + ' ha';
  return sq.toFixed(1) + ' m\u00B2';
}

function formatDistShort(m) { return formatDistance(m); }

function computeDistance(latlngs) {
  var total = 0;
  for (var i = 1; i < latlngs.length; i++) total += latlngs[i - 1].distanceTo(latlngs[i]);
  return total;
}

function computeArea(latlngs) {
  if (latlngs.length < 3) return 0;
  var area = 0, radius = 6378137;
  for (var i = 0; i < latlngs.length; i++) {
    var p1 = latlngs[i], p2 = latlngs[(i + 1) % latlngs.length];
    area += toRad(p2.lng - p1.lng) * (2 + Math.sin(toRad(p1.lat)) + Math.sin(toRad(p2.lat)));
  }
  return Math.abs(area * radius * radius / 2);
}

function stopMeasure() {
  map.off('click', handleMeasureClick);
  map.off('dblclick', handleMeasureDoubleClick);
  map.off('mousemove', handleMeasureMouseMove);
  map.off('keydown', handleMeasureKeyDown);
  map.doubleClickZoom.enable();
  map.getContainer().style.cursor = '';
  document.querySelectorAll('.measure-btn').forEach(function(btn) { btn.classList.remove('active'); });
  var wasActive = measureActive;
  measureActive = false;
  if (wasActive) setMeasureStatus(false);
}

function startMeasure() {
  if (measureActive) stopMeasure();
  map.closePopup();
  measureActive = true;
  map.doubleClickZoom.disable();
  if (measureLayer.getLayers().length > 0) measureLayer.bringToFront();
  map.getContainer().style.cursor = 'crosshair';
  measureMarkers = [];
  if (measureLine) { measureLayer.removeLayer(measureLine); measureLine = null; }
  if (measurePolygon) { measureLayer.removeLayer(measurePolygon); measurePolygon = null; }
  if (measureCircle) { measureLayer.removeLayer(measureCircle); measureCircle = null; }
  if (measureCircleMarker) { measureLayer.removeLayer(measureCircleMarker); measureCircleMarker = null; }
  if (measureCircleRadiusLine) { measureLayer.removeLayer(measureCircleRadiusLine); measureCircleRadiusLine = null; }
  measureCircleCenter = null;
  map.on('click', handleMeasureClick);
  map.on('dblclick', handleMeasureDoubleClick);
  map.on('mousemove', handleMeasureMouseMove);
  map.on('keydown', handleMeasureKeyDown);
  setMeasureStatus(true);
}

function setMeasureStatus(active) {
  var statusEl = document.getElementById('measureStatus');
  var statusText = document.getElementById('measureStatusText');
  if (!statusEl) return;
  if (active) {
    statusText.textContent = 'Measuring...';
    statusEl.classList.remove('inactive');
  } else {
    statusText.textContent = 'Select a tool to start';
    statusEl.classList.add('inactive');
  }
}

/* ===============================
   POINT INFO POPUP
   =============================== */
var pointInfoPopupLat = 0, pointInfoPopupLng = 0;

function computeBearing(lat1, lon1, lat2, lon2) {
  var dLon = toRad(lon2 - lon1);
  var y = Math.sin(dLon) * Math.cos(toRad(lat2));
  var x = Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) - Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon);
  return ((Math.atan2(y, x) * 180 / Math.PI) + 360) % 360;
}

function bearingToDirection(bearing) {
  var dirs = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
  return dirs[Math.round(bearing / 22.5) % 16];
}

function showPointInfoPopup(latlng, pointIndex) {
  var popup = document.getElementById('pointInfoPopup');
  if (!popup) return;
  pointInfoPopupLat = latlng.lat;
  pointInfoPopupLng = latlng.lng;

  document.getElementById('popupTitle').textContent = 'Point ' + pointIndex;
  document.getElementById('popupLat').textContent = latlng.lat.toFixed(6) + '\u00B0';
  document.getElementById('popupLng').textContent = latlng.lng.toFixed(6) + '\u00B0';
  document.getElementById('popupLatDMS').textContent = toDMS(latlng.lat, true);
  document.getElementById('popupLngDMS').textContent = toDMS(latlng.lng, false);

  var distSection = document.getElementById('popupDistanceSection');
  if (pointIndex > 1 && measureMarkers.length > 1) {
    var prevLatLng = measureMarkers[measureMarkers.length - 2].getLatLng();
    var distFromPrev = prevLatLng.distanceTo(latlng);
    var totalDist = 0;
    for (var i = 1; i < measureMarkers.length; i++) totalDist += measureMarkers[i - 1].getLatLng().distanceTo(measureMarkers[i].getLatLng());
    document.getElementById('popupDistPrev').textContent = formatDistShort(distFromPrev);
    document.getElementById('popupDistTotal').textContent = formatDistShort(totalDist);
    distSection.style.display = 'block';
  } else if (measureMode === 'circle' && measureCircleCenter && pointIndex > 1) {
    var radius = measureCircleCenter.distanceTo(latlng);
    document.getElementById('popupDistPrev').textContent = formatDistShort(radius) + ' (radius)';
    document.getElementById('popupDistTotal').textContent = formatDistShort(radius);
    distSection.style.display = 'block';
  } else {
    distSection.style.display = 'none';
  }

  var bearSection = document.getElementById('popupBearingSection');
  if (pointIndex > 1 && measureMarkers.length > 1) {
    var prevLatLng = measureMarkers[measureMarkers.length - 2].getLatLng();
    var bearing = computeBearing(prevLatLng.lat, prevLatLng.lng, latlng.lat, latlng.lng);
    document.getElementById('popupBearing').textContent = bearing.toFixed(2) + '\u00B0';
    document.getElementById('popupDirection').textContent = bearingToDirection(bearing);
    bearSection.style.display = 'block';
  } else {
    bearSection.style.display = 'none';
  }

  document.getElementById('popupPointNum').textContent = pointIndex;
  document.getElementById('popupTime').textContent = new Date().toLocaleTimeString();
  popup.style.display = 'block';
}

function hidePointInfoPopup() {
  var popup = document.getElementById('pointInfoPopup');
  if (popup) popup.style.display = 'none';
}

function handleMeasureClick(e) {
  if (!measureActive) return;
  var latlng = e.latlng;

  if (measureMode === 'line' || measureMode === 'polygon') {
    measureMarkers.push(L.circleMarker(latlng, { radius: 5, color: '#000', weight: 2, fillColor: '#fff', fillOpacity: 1 }).addTo(measureLayer));
    if (measureMarkers.length === 2 && measureMode === 'line') {
      measureLine = L.polyline([measureMarkers[0].getLatLng(), measureMarkers[1].getLatLng()], { color: '#1f6f43', weight: 3, opacity: 0.8 }).addTo(measureLayer);
    } else if (measureMarkers.length > 2 && measureMode === 'line' && measureLine) {
      measureLine.addLatLng(latlng);
    } else if (measureMarkers.length > 1 && measureMode === 'polygon') {
      if (!measurePolygon) measurePolygon = L.polygon(measureMarkers.map(function(m) { return m.getLatLng(); }), { color: '#1f6f43', weight: 3, opacity: 0.8, fillColor: '#1f6f43', fillOpacity: 0.2 }).addTo(measureLayer);
      else measurePolygon.addLatLng(latlng);
    }
    showPointInfoPopup(latlng, measureMarkers.length);
  } else if (measureMode === 'circle') {
    if (!measureCircleCenter) {
      measureCircleCenter = latlng;
      measureCircleMarker = L.circleMarker(latlng, { radius: 6, color: '#000', weight: 2, fillColor: '#fff', fillOpacity: 1 }).addTo(measureLayer);
      measureMarkers.push(measureCircleMarker);
      showPointInfoPopup(latlng, 1);
    } else {
      showPointInfoPopup(latlng, 2);
      finishMeasure();
      return;
    }
  }
  updateMeasureResult();
}

function handleMeasureDoubleClick(e) {
  if (!measureActive) return;
  L.DomEvent.stopPropagation(e);
  L.DomEvent.preventDefault(e);
  if (measureMode === 'line' || measureMode === 'polygon') {
    var removeCount = Math.min(2, measureMarkers.length);
    for (var i = 0; i < removeCount; i++) { var removed = measureMarkers.pop(); if (removed) measureLayer.removeLayer(removed); }
    if (measureMode === 'line') {
      if (measureLine) measureLayer.removeLayer(measureLine);
      measureLine = null;
      if (measureMarkers.length >= 2) measureLine = L.polyline(measureMarkers.map(function(m) { return m.getLatLng(); }), { color: '#1f6f43', weight: 3, opacity: 0.8 }).addTo(measureLayer);
    } else {
      if (measurePolygon) measureLayer.removeLayer(measurePolygon);
      measurePolygon = null;
      if (measureMarkers.length >= 3) measurePolygon = L.polygon(measureMarkers.map(function(m) { return m.getLatLng(); }), { color: '#1f6f43', weight: 3, opacity: 0.8, fillColor: '#1f6f43', fillOpacity: 0.2 }).addTo(measureLayer);
    }
  }
  finishMeasure();
}

function handleMeasureMouseMove(e) {
  if (!measureActive || !e.latlng) return;
  var resultEl = document.getElementById('measureResult');

  if (measureMode === 'line' && measureMarkers.length > 0) {
    var linePoints = measureMarkers.map(function(m) { return m.getLatLng(); }).concat([e.latlng]);
    if (measureLine) measureLine.setLatLngs(linePoints);
    else if (measureMarkers.length === 1) measureLine = L.polyline([measureMarkers[0].getLatLng(), e.latlng], { color: '#1f6f43', weight: 3, opacity: 0.7, dashArray: '5,5' }).addTo(measureLayer);
    resultEl.textContent = 'Distance: ' + formatDistance(computeDistance(measureLine.getLatLngs()));
    resultEl.style.display = 'block';
  } else if (measureMode === 'polygon' && measureMarkers.length > 0) {
    var polyPoints = measureMarkers.map(function(m) { return m.getLatLng(); }).concat([e.latlng]);
    if (measureMarkers.length === 1) {
      if (!measureLine) measureLine = L.polyline([measureMarkers[0].getLatLng(), e.latlng], { color: '#1f6f43', weight: 3, opacity: 0.7, dashArray: '5,5' }).addTo(measureLayer);
      else measureLine.setLatLngs([measureMarkers[0].getLatLng(), e.latlng]);
    } else {
      if (measureLine) { measureLayer.removeLayer(measureLine); measureLine = null; }
      if (!measurePolygon) measurePolygon = L.polygon(polyPoints, { color: '#1f6f43', weight: 3, opacity: 0.7, fillColor: '#1f6f43', fillOpacity: 0.2, dashArray: '5,5' }).addTo(measureLayer);
      else measurePolygon.setLatLngs(polyPoints);
      resultEl.textContent = 'Area: ' + formatArea(computeArea(measurePolygon.getLatLngs()[0]));
      resultEl.style.display = 'block';
    }
  } else if (measureMode === 'circle' && measureCircleCenter) {
    var radius = measureCircleCenter.distanceTo(e.latlng);
    if (!measureCircle) {
      measureCircle = L.circle(measureCircleCenter, { radius: radius, color: '#1f6f43', weight: 3, opacity: 0.7, fillColor: '#1f6f43', fillOpacity: 0.2 }).addTo(measureLayer);
      measureCircleRadiusLine = L.polyline([measureCircleCenter, e.latlng], { color: '#1f6f43', weight: 1, opacity: 0.7, dashArray: '5,5' }).addTo(measureLayer);
    } else {
      measureCircle.setRadius(radius);
      measureCircleRadiusLine.setLatLngs([measureCircleCenter, e.latlng]);
    }
    resultEl.textContent = 'Radius: ' + formatDistance(radius) + ' | Area: ' + formatArea(Math.PI * radius * radius);
    resultEl.style.display = 'block';
  }
}

function handleMeasureKeyDown(e) {
  if (!measureActive) return;
  if (e.key === 'Escape') { clearMeasure(); stopMeasure(); }
  else if (e.key === 'Backspace' || e.key === 'Delete') { e.preventDefault(); undoMeasurePoint(); }
}

function updateMeasureResult() {
  var resultEl = document.getElementById('measureResult');
  if (!resultEl) return;
  if (measureMode === 'line' && measureLine) {
    resultEl.textContent = 'Distance: ' + formatDistance(computeDistance(measureLine.getLatLngs()));
    resultEl.style.display = 'block';
  } else if (measureMode === 'polygon' && measurePolygon) {
    resultEl.textContent = 'Area: ' + formatArea(computeArea(measurePolygon.getLatLngs()[0]));
    resultEl.style.display = 'block';
  } else if (measureMode === 'circle' && measureCircle) {
    var r = measureCircle.getRadius();
    resultEl.textContent = 'Radius: ' + formatDistance(r) + ' | Area: ' + formatArea(Math.PI * r * r);
    resultEl.style.display = 'block';
  }
}

function finishMeasure() {
  if (measureMode === 'line' && measureLine) measureLine.setStyle({ dashArray: null });
  else if (measureMode === 'polygon') {
    if (measureLine) { measureLayer.removeLayer(measureLine); measureLine = null; }
    if (measurePolygon) measurePolygon.setStyle({ dashArray: null });
  } else if (measureMode === 'circle') {
    if (measureCircleRadiusLine) { measureLayer.removeLayer(measureCircleRadiusLine); measureCircleRadiusLine = null; }
  }
  updateMeasureResult();
  stopMeasure();
  showToast('Measurement complete', 'success', 2000);
}

function undoMeasurePoint() {
  if (!measureActive) return;
  if (measureMode === 'line' || measureMode === 'polygon') {
    if (measureMarkers.length > 0) {
      measureLayer.removeLayer(measureMarkers.pop());
      if (measureMarkers.length === 0) {
        if (measureLine) { measureLayer.removeLayer(measureLine); measureLine = null; }
        if (measurePolygon) { measureLayer.removeLayer(measurePolygon); measurePolygon = null; }
        hidePointInfoPopup();
      } else {
        if (measureMode === 'line' && measureLine) { measureLine.setLatLngs(measureMarkers.map(function(m) { return m.getLatLng(); })); }
        else if (measureMode === 'polygon' && measurePolygon) { measurePolygon.setLatLngs(measureMarkers.map(function(m) { return m.getLatLng(); })); }
        var last = measureMarkers[measureMarkers.length - 1];
        if (last) showPointInfoPopup(last.getLatLng(), measureMarkers.length);
      }
    }
  } else if (measureMode === 'circle' && measureCircleCenter) {
    if (measureCircleMarker) measureLayer.removeLayer(measureCircleMarker);
    if (measureCircle) measureLayer.removeLayer(measureCircle);
    if (measureCircleRadiusLine) measureLayer.removeLayer(measureCircleRadiusLine);
    measureCircleMarker = null; measureCircle = null; measureCircleRadiusLine = null; measureCircleCenter = null;
    hidePointInfoPopup();
  }
  updateMeasureResult();
}

function clearMeasure() {
  measureLayer.clearLayers();
  measureMarkers = [];
  measureLine = null; measurePolygon = null; measureCircle = null;
  measureCircleCenter = null; measureCircleMarker = null; measureCircleRadiusLine = null;
  userCoordinateMarker = null;
  var resultEl = document.getElementById('measureResult');
  if (resultEl) { resultEl.textContent = ''; resultEl.style.display = 'none'; }
  hidePointInfoPopup();
}

function clearImportedKML() {
  importedLayer.clearLayers();
  showToast('Imported KML cleared', 'info');
}

function setMeasurementMode(mode) {
  measureMode = mode;
  clearMeasure();
  startMeasure();
  document.querySelectorAll('.measure-btn').forEach(function(btn) { btn.classList.remove('active'); });
  var btnId = 'measure' + mode.charAt(0).toUpperCase() + mode.slice(1) + 'Btn';
  var activeBtn = document.getElementById(btnId);
  if (activeBtn) activeBtn.classList.add('active');
}

function exportMeasurementAsKML() {
  if (measureMarkers.length === 0) { showToast('No measurement to export.', 'error'); return; }
  var coords = measureMarkers.map(function(marker) { var ll = marker.getLatLng(); return [ll.lng, ll.lat, 0]; });
  var placemarkXml = '';
  var timestamp = new Date().toISOString();

  if (measureMode === 'circle') {
    var center = measureMarkers[0].getLatLng();
    var radius = measureCircle ? measureCircle.getRadius() : 0;
    placemarkXml = '<Placemark><name>Circle</name><description>Radius: ' + radius.toFixed(2) + ' m</description><Point><coordinates>' + center.lng + ',' + center.lat + ',0</coordinates></Point></Placemark>';
  } else if (measureMode === 'line') {
    var dist = computeDistance(measureMarkers.map(function(m) { return m.getLatLng(); }));
    var coordStr = coords.map(function(c) { return c[0] + ',' + c[1] + ',' + c[2]; }).join('\n      ');
    placemarkXml = '<Placemark><name>Distance</name><description>Total: ' + dist.toFixed(2) + ' m</description><Style><LineStyle><color>ff00ff00</color><width>2</width></LineStyle></Style><LineString><coordinates>\n      ' + coordStr + '\n      </coordinates></LineString></Placemark>';
  } else if (measureMode === 'polygon') {
    var area = computeArea(measureMarkers.map(function(m) { return m.getLatLng(); }));
    var ringCoords = coords.slice(); ringCoords.push(coords[0]);
    var coordStr = ringCoords.map(function(c) { return c[0] + ',' + c[1] + ',' + c[2]; }).join('\n        ');
    placemarkXml = '<Placemark><name>Area</name><description>Area: ' + area.toFixed(2) + ' m\u00B2</description><Style><PolyStyle><color>8000ff00</color><fill>1</fill></PolyStyle></Style><Polygon><outerBoundaryIs><LinearRing><coordinates>\n        ' + coordStr + '\n          </coordinates></LinearRing></outerBoundaryIs></Polygon></Placemark>';
  }

  var kmlStr = '<?xml version="1.0" encoding="UTF-8"?>\n<kml xmlns="http://www.opengis.net/kml/2.2">\n<Document><name>Measurement Export</name><description>Exported ' + timestamp + '</description>\n' + placemarkXml + '\n</Document></kml>';
  var dataBlob = new Blob([kmlStr], { type: 'application/vnd.google-earth.kml+xml' });
  var url = URL.createObjectURL(dataBlob);
  var link = document.createElement('a');
  link.href = url; link.download = 'measurement_' + Date.now() + '.kml'; link.click();
  URL.revokeObjectURL(url);
  showToast('KML exported successfully!', 'success');
}

function parseGeoJSON(geojsonStr) {
  var data;
  try { data = JSON.parse(geojsonStr); } catch (e) { throw new Error('Invalid GeoJSON: ' + e.message); }
  importedLayer.clearLayers();
  document.getElementById('importFileInput').value = '';
  if (!data || !data.features) throw new Error('GeoJSON must be a FeatureCollection.');
  var count = 0;
  data.features.forEach(function(feature) {
    if (!feature.geometry) return;
    var name = (feature.properties && feature.properties.name) || 'Feature ' + (count + 1);
    var geom = feature.geometry;
    if (geom.type === 'Point') {
      L.circleMarker([geom.coordinates[1], geom.coordinates[0]], { radius: 6, color: '#e74c3c', weight: 2, fillColor: '#fff', fillOpacity: 1 }).bindPopup(name).addTo(importedLayer);
      count++;
    } else if (geom.type === 'LineString' || geom.type === 'MultiLineString') {
      var latlngs = [];
      if (geom.type === 'LineString') latlngs = geom.coordinates.map(function(c) { return L.latLng(c[1], c[0]); });
      else geom.coordinates.forEach(function(line) { line.forEach(function(c) { latlngs.push(L.latLng(c[1], c[0])); }); });
      L.polyline(latlngs, { color: '#3498db', weight: 3, opacity: 0.8 }).bindPopup(name).addTo(importedLayer);
      count++;
    } else if (geom.type === 'Polygon' || geom.type === 'MultiPolygon') {
      var latlngs = [];
      if (geom.type === 'Polygon') latlngs = geom.coordinates[0].map(function(c) { return L.latLng(c[1], c[0]); });
      else geom.coordinates.forEach(function(poly) { poly[0].forEach(function(c) { latlngs.push(L.latLng(c[1], c[0])); }); });
      L.polygon(latlngs, { color: '#27ae60', weight: 2, fillColor: '#27ae60', fillOpacity: 0.2 }).bindPopup(name).addTo(importedLayer);
      count++;
    }
  });
  if (importedLayer.getLayers().length > 0) map.fitBounds(importedLayer.getBounds().pad(0.1));
  return count;
}

function parseKML(kmlString) {
  var parser = new DOMParser();
  var kmlDoc = parser.parseFromString(kmlString, 'text/xml');
  if (kmlDoc.parsererror) throw new Error('Invalid KML file');
  importedLayer.clearLayers();
  document.getElementById('importFileInput').value = '';
  var placemarks = kmlDoc.getElementsByTagName('Placemark');
  Array.from(placemarks).forEach(function(pm) {
    var name = pm.getElementsByTagName('name')[0];
    var nameStr = name ? name.textContent : 'Feature';
    var point = pm.getElementsByTagName('Point')[0];
    var linestring = pm.getElementsByTagName('LineString')[0];
    var polygon = pm.getElementsByTagName('Polygon')[0];
    if (point) {
      var coords = point.getElementsByTagName('coordinates')[0].textContent.trim().split(',');
      L.circleMarker(L.latLng(parseFloat(coords[1]), parseFloat(coords[0])), { radius: 6, color: '#e74c3c', weight: 2, fillColor: '#fff', fillOpacity: 1 }).bindPopup(nameStr).addTo(importedLayer);
    } else if (linestring) {
      var coordsText = linestring.getElementsByTagName('coordinates')[0].textContent.trim();
      var latlngs = coordsText.split(/\s+/).map(function(p) { var parts = p.split(','); return L.latLng(parseFloat(parts[1]), parseFloat(parts[0])); }).filter(function(ll) { return !isNaN(ll.lat) && !isNaN(ll.lng); });
      L.polyline(latlngs, { color: '#3498db', weight: 2, opacity: 0.8 }).bindPopup(nameStr).addTo(importedLayer);
    } else if (polygon) {
      var outerRing = polygon.getElementsByTagName('outerBoundaryIs')[0];
      if (outerRing) {
        var coordsText = outerRing.getElementsByTagName('coordinates')[0].textContent.trim();
        var latlngs = coordsText.split(/\s+/).map(function(p) { var parts = p.split(','); return L.latLng(parseFloat(parts[1]), parseFloat(parts[0])); }).filter(function(ll) { return !isNaN(ll.lat) && !isNaN(ll.lng); });
        L.polygon(latlngs, { color: '#27ae60', weight: 2, fillColor: '#27ae60', fillOpacity: 0.2 }).bindPopup(nameStr).addTo(importedLayer);
      }
    }
  });
  if (importedLayer.getLayers().length > 0) map.fitBounds(importedLayer.getBounds().pad(0.1));
}

/* ===============================
   WIRE UP MEASUREMENT BUTTONS
   =============================== */
document.getElementById('measureLineBtn').addEventListener('click', function() { setMeasurementMode('line'); });
document.getElementById('measurePolygonBtn').addEventListener('click', function() { setMeasurementMode('polygon'); });
document.getElementById('measureCircleBtn').addEventListener('click', function() { setMeasurementMode('circle'); });
document.getElementById('measureUndoBtn').addEventListener('click', undoMeasurePoint);
document.getElementById('measureClearBtn').addEventListener('click', function() { clearMeasure(); stopMeasure(); });
document.getElementById('clearImportedKMLBtn').addEventListener('click', clearImportedKML);
document.getElementById('measureImportBtn').addEventListener('click', function() { document.getElementById('importFileInput').click(); });
document.getElementById('measureExportKMLBtn').addEventListener('click', exportMeasurementAsKML);

document.getElementById('importFileInput').addEventListener('change', function(e) {
  var file = e.target.files[0];
  if (!file) return;
  var fileName = file.name.toLowerCase();
  var reader = new FileReader();
  reader.onload = function(event) {
    try {
      if (fileName.endsWith('.kml')) {
        parseKML(event.target.result);
        showToast('KML imported: ' + importedLayer.getLayers().length + ' feature(s)', 'success');
      } else if (fileName.endsWith('.geojson') || fileName.endsWith('.json')) {
        var count = parseGeoJSON(event.target.result);
        showToast('GeoJSON imported: ' + count + ' feature(s)', 'success');
      } else {
        showToast('Unsupported format. Use .kml or .geojson', 'error');
      }
    } catch (err) { showToast('Error: ' + err.message, 'error'); }
  };
  reader.readAsText(file);
  e.target.value = '';
});

document.getElementById('measureInputCoordBtn').addEventListener('click', function() {
  var popup = document.getElementById('pointInfoPopup');
  if (popup) {
    popup.style.display = 'block';
    document.getElementById('popupTitle').textContent = 'Input Coordinate';
    document.getElementById('popupLat').textContent = '\u2014';
    document.getElementById('popupLng').textContent = '\u2014';
    document.getElementById('popupLatDMS').textContent = '\u2014';
    document.getElementById('popupLngDMS').textContent = '\u2014';
    document.getElementById('popupDistanceSection').style.display = 'none';
    document.getElementById('popupBearingSection').style.display = 'none';
    document.getElementById('popupPointNum').textContent = '\u2014';
    document.getElementById('popupTime').textContent = '\u2014';
    setTimeout(function() { document.getElementById('popupInputLat').focus(); }, 100);
  }
});

document.getElementById('plotCoordinateBtn').addEventListener('click', plotUserCoordinate);
document.getElementById('coordinateInputLat').addEventListener('keydown', function(e) { if (e.key === 'Enter') plotUserCoordinate(); });
document.getElementById('coordinateInputLng').addEventListener('keydown', function(e) { if (e.key === 'Enter') plotUserCoordinate(); });
document.getElementById('closeCoordinateInputBtn').addEventListener('click', function() { toggleCoordinateInputPanel(false); });

/* ===============================
   POINT INFO POPUP BUTTONS
   =============================== */
document.getElementById('popupCloseBtn').addEventListener('click', hidePointInfoPopup);
document.getElementById('popupZoomBtn').addEventListener('click', function() { map.setView([pointInfoPopupLat, pointInfoPopupLng], 16); });

document.getElementById('popupPlotCoordBtn').addEventListener('click', function() {
  var lat = parseDMS(document.getElementById('popupInputLat').value);
  var lng = parseDMS(document.getElementById('popupInputLng').value);
  if (lat === null || lng === null || isNaN(lat) || isNaN(lng)) { showToast('Invalid coordinates.', 'error'); return; }
  if (userCoordinateMarker) measureLayer.removeLayer(userCoordinateMarker);
  userCoordinateMarker = L.marker([lat, lng], {
    icon: L.icon({ iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png', iconSize: [25, 41], iconAnchor: [12, 41] })
  }).addTo(measureLayer).bindPopup('Coordinate: ' + lat.toFixed(6) + ', ' + lng.toFixed(6));
  map.setView([lat, lng], 15);
  showPointInfoPopup(L.latLng(lat, lng), 1);
  document.getElementById('popupInputLat').value = '';
  document.getElementById('popupInputLng').value = '';
  showToast('Coordinate plotted!', 'success');
});

document.getElementById('popupCancelCoordBtn').addEventListener('click', function() {
  document.getElementById('popupInputLat').value = '';
  document.getElementById('popupInputLng').value = '';
});

document.getElementById('popupInputLat').addEventListener('keydown', function(e) { if (e.key === 'Enter') document.getElementById('popupPlotCoordBtn').click(); });
document.getElementById('popupInputLng').addEventListener('keydown', function(e) { if (e.key === 'Enter') document.getElementById('popupPlotCoordBtn').click(); });

/* ===============================
   MEASURE PANEL CLOSE BUTTON
   =============================== */
document.getElementById('measurePanelClose').addEventListener('click', function() {
  document.getElementById('measurePanel').style.display = 'none';
  document.getElementById('chkMeasure').checked = false;
  stopMeasure();
});

/* ===============================
   BASEMAP SWITCHER (Sidebar)
   =============================== */
var basemapLayers = {
  googleHybrid: googleHybrid,
  googleStreets: googleStreets,
  satellite: satelliteMap,
  osm: osmMap,
  dark: darkMap
};

var currentBasemap = googleHybrid;

document.querySelectorAll('input[name="basemap"]').forEach(function(radio) {
  radio.addEventListener('change', function() {
    var val = this.value;
    if (basemapLayers[val] && basemapLayers[val] !== currentBasemap) {
      map.removeLayer(currentBasemap);
      currentBasemap = basemapLayers[val];
      currentBasemap.addTo(map);
      showToast('Basemap: ' + this.closest('.basemap-option').querySelector('.basemap-label').textContent.trim(), 'info', 1500);
    }
  });
});

/* ===============================
   GEE LINKS
   =============================== */
function openGEE() {
  var links = {
    ndvi: "https://swift-branch-391106.projects.earthengine.app/view/ndvi",
    evi: "https://swift-branch-391106.projects.earthengine.app/view/evi",
    rainfall: "https://swift-branch-391106.projects.earthengine.app/view/rainfallupdate",
    temperature: "https://swift-branch-391106.projects.earthengine.app/view/temp-application",
    vhi: "https://swift-branch-391106.projects.earthengine.app/view/vhi",
    tci: "https://swift-branch-391106.projects.earthengine.app/view/tci",
    vci: "https://swift-branch-391106.projects.earthengine.app/view/vci",
    forest_health: "https://swift-branch-391106.projects.earthengine.app/view/forest-health-index",
    plantation: "https://swift-branch-391106.projects.earthengine.app/view/landsuitability",
    fsi: "https://swift-branch-391106.projects.earthengine.app/view/forest-density-classification",
    fsi_alert: "https://swift-branch-391106.projects.earthengine.app/view/fire-alerts",
    lulc: "https://swift-branch-391106.projects.earthengine.app/view/central-chanda-lulc",
    Waterbody: "https://earthengine.app/view/VCI_APP_URL",
    Deforest_Loss_Gain: "https://swift-branch-391106.projects.earthengine.app/view/deforestation",
    FOREST_DROUGHT_STRESS_INDEX: "https://swift-branch-391106.projects.earthengine.app/view/forest-drought-stress-index",
    FOREST_GROWTH_RATE_INDEX: "https://swift-branch-391106.projects.earthengine.app/view/forest-growth-rate-index",
    Above_Ground_Biomass: "https://swift-branch-391106.projects.earthengine.app/view/above-ground-biomass",
    Below_Ground_Biomass: "https://swift-branch-391106.projects.earthengine.app/view/below-ground-biomass",
    canopy_height_models: "https://swift-branch-391106.projects.earthengine.app/view/canopy-height-model-chm"
  };
  var key = document.getElementById("geeSelect").value;
  if (links[key]) { window.open(links[key], "_blank"); showToast('Opening ' + key.toUpperCase() + '...', 'info'); }
  else showToast('Please select a parameter first.', 'error');
}

function loadStaticLayer() {
  var val = document.getElementById('staticSelect').value;
  var staticMap = {
    "Soil_Depth": { layer: soilDepthLayer, file: "Soil_Depth.geojson", color: "#f4a261", nameProp: "class", label: "Soil Depth", srcCrs: "EPSG:32643", fillOpacity: 0.5 },
    "Soil_Erosion": { layer: soilErosionLayer, file: "Soil_Erosion.geojson", color: "#fd8d3c", nameProp: "descr", label: "Soil Erosion", srcCrs: "EPSG:32643", fillOpacity: 0.5 },
    "Soil_Slope": { layer: soilSlopeLayer, file: "Soil_Slope.geojson", color: "#41b6c4", nameProp: "descr", label: "Soil Slope", srcCrs: "EPSG:32643", fillOpacity: 0.5 },
    "Soil_Productivity": { layer: soilProductivityLayer, file: "Soil_Productivity.geojson", color: "#91cf60", nameProp: "prod_class", label: "Soil Productivity", srcCrs: "EPSG:32643", fillOpacity: 0.5 },
    "Soil_Texture": { layer: soilTextureLayer, file: "Soil_Texture.geojson", color: "#74a9cf", nameProp: "descr", label: "Soil Texture", srcCrs: "EPSG:32643", fillOpacity: 0.5 }
  };
  clearAllDropdownLayers();
  if (val && staticMap[val]) {
    var item = staticMap[val];
    if (item.layer.getLayers().length === 0) loadBoundaryLayer(item.file, item.layer, item.color, item.nameProp, item.label, true, item.srcCrs, item.fillOpacity, true);
    map.addLayer(item.layer);
    zoomToVisibleLayers();
    updateLegend();
    showToast('Layer loaded: ' + item.label, 'success');
  } else { updateLegend(); }
}

function clearAllDropdownLayers() {
  [waterbodyLayer, streamNetworkLayer, restHouseLayer, jogapursafariLayer, karwasafariLayer, fdcmLayer, kanhargaonWlsLayer, soilDepthLayer, soilErosionLayer, soilSlopeLayer, soilProductivityLayer, soilTextureLayer, rangeofficeLayer, roundofficeLayer, iwcLayer, fwcLayer, sciLayer, otplLayer].forEach(function(layer) {
    if (map.hasLayer(layer)) map.removeLayer(layer);
    if (layer.clearLayers) layer.clearLayers();
  });
  updateLegend();
}

function loadPoiLayer() {
  var val = document.getElementById('poiSelect').value;
  var layerMap = { "waterbody": waterbodyLayer, "streamNetwork": streamNetworkLayer };
  clearAllDropdownLayers();
  if (!val || !layerMap[val]) {
    updateLegend();
    return;
  }

  if (val === 'waterbody' && waterbodyLayer.getLayers().length === 0) {
    loadPointLayer("Waterbody_cc.geojson", waterbodyLayer, '<span>💧</span>', "Attribute", "Waterbody", true);
  }
  if (val === 'streamNetwork' && streamNetworkLayer.getLayers().length === 0) {
    loadBoundaryLayer("Stream_Network.geojson", streamNetworkLayer, "deepskyblue", "ORD_STRA", "Stream Network", true, "EPSG:32644", 0.0, false);
  }

  map.addLayer(layerMap[val]);
  zoomToVisibleLayers();
  updateLegend();
  showToast('Layer loaded', 'success');
}

function loadOtherLayer() {
  var val = document.getElementById('otherSelect').value;
  var layerMap = { "fdcm": fdcmLayer, "kanhargaon": kanhargaonWlsLayer };
  clearAllDropdownLayers();
  if (!val || !layerMap[val]) {
    updateLegend();
    return;
  }

  if (val === 'fdcm' && fdcmLayer.getLayers().length === 0) {
    loadBoundaryLayer("FDCM.geojson", fdcmLayer, "#795548", "FDCM", "FDCM Boundary", true, "EPSG:32644", 0.0, false);
  }
  if (val === 'kanhargaon' && kanhargaonWlsLayer.getLayers().length === 0) {
    loadBoundaryLayer("Kanhargaon WLS.geojson", kanhargaonWlsLayer, "#4CAF50", "Name", "Kanhargaon WLS", true, "EPSG:32644", 0.0, false);
  }

  map.addLayer(layerMap[val]);
  zoomToVisibleLayers();
  updateLegend();
  showToast('Layer loaded', 'success');
}

function loadOfficeLayer() {
  var val = document.getElementById('officeSelect').value;
  var layerMap = { "rangeoffice": rangeofficeLayer, "roundoffice": roundofficeLayer, "restHouse": restHouseLayer };
  clearAllDropdownLayers();
  if (!val || !layerMap[val]) {
    updateLegend();
    return;
  }

  if (val === 'rangeoffice' && rangeofficeLayer.getLayers().length === 0) {
    loadPointLayer("Range office Headquarters.geojson", rangeofficeLayer, '<span>🏢</span>', "Attribute", "Range Office Headquarters", true);
  }
  if (val === 'roundoffice' && roundofficeLayer.getLayers().length === 0) {
    loadPointLayer("Round_Office_Headquarters.sbx.geojson", roundofficeLayer, '<span>🏠</span>', "Attribute", "Round Office", true);
  }
  if (val === 'restHouse' && restHouseLayer.getLayers().length === 0) {
    loadPointLayer("Rest House.geojson", restHouseLayer, '<span>🏡</span>', "Attribute", "Rest House", true);
  }

  map.addLayer(layerMap[val]);
  zoomToVisibleLayers();
  updateLegend();
  showToast('Layer loaded', 'success');
}

function loadSafariLayer() {
  var val = document.getElementById('safariSelect').value;
  var layerMap = { "jogapur": jogapursafariLayer, "karwa": karwasafariLayer };
  clearAllDropdownLayers();
  if (!val || !layerMap[val]) {
    updateLegend();
    return;
  }

  if (val === 'jogapur' && jogapursafariLayer.getLayers().length === 0) {
    loadBoundaryLayer("Jogapur_Safari_Route.geojson", jogapursafariLayer, "#E91E63", "Name", "Jogapur Safari", true, "EPSG:32644", 0.0, false);
  }
  if (val === 'karwa' && karwasafariLayer.getLayers().length === 0) {
    loadBoundaryLayer("karwa_Safari_Route_Demo.geojson", karwasafariLayer, "#E91E63", "Name", "Karwa Safari", true, "EPSG:32644", 0.0, false);
  }

  map.addLayer(layerMap[val]);
  zoomToVisibleLayers();
  updateLegend();
  showToast('Layer loaded', 'success');
}

function loadCoupe_plantationLayers() {
  var val = document.getElementById('Coupe_plantationSelect').value;
  var coupeMap = {
    "IWC": { layer: iwcLayer, file: "IWC.geojson", color: "#1f77b4", nameProp: "Coupe_No", label: "IWC Plantation", srcCrs: "EPSG:32644", fillOpacity: 0.0 },
    "FWC": { layer: fwcLayer, file: "FWC.geojson", color: "#ff7f0e", nameProp: "Coupe_No", label: "FWC Plantation", srcCrs: "EPSG:32644", fillOpacity: 0.0 },
    "SCI": { layer: sciLayer, file: "SCI.geojson", color: "#2ca02c", nameProp: "Coupe_No", label: "SCI Plantation", srcCrs: "EPSG:32644", fillOpacity: 0.0 },
    "OTPL": { layer: otplLayer, file: "OTPL.geojson", color: "#d62728", nameProp: "Coupe_No", label: "OTPL Plantation", srcCrs: "EPSG:32644", fillOpacity: 0.0 }
  };
  clearAllDropdownLayers();
  if (val && coupeMap[val]) {
    var item = coupeMap[val];
    if (item.layer.getLayers().length === 0) loadBoundaryLayer(item.file, item.layer, item.color, item.nameProp, item.label, true, item.srcCrs, item.fillOpacity, true);
    map.addLayer(item.layer);
    zoomToVisibleLayers();
    updateLegend();
    showToast('Layer loaded: ' + item.label, 'success');
  } else { updateLegend(); }
}

/* ===============================
   DRAGGABLE PANELS
   =============================== */
function makeDraggable(el) {
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  var handle = el.querySelector('.measure-header') || el.querySelector('.popup-header') || el.querySelector('h3') || el;
  handle.style.cursor = 'move';
  handle.onmousedown = dragMouseDown;
  handle.ontouchstart = dragTouchStart;

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    pos3 = e.clientX; pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
  }

  function dragTouchStart(e) {
    var touch = e.touches[0];
    pos3 = touch.clientX; pos4 = touch.clientY;
    document.ontouchend = closeDragElement;
    document.ontouchmove = elementDragTouch;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    pos1 = pos3 - e.clientX; pos2 = pos4 - e.clientY;
    pos3 = e.clientX; pos4 = e.clientY;
    el.style.top = (el.offsetTop - pos2) + "px";
    el.style.left = (el.offsetLeft - pos1) + "px";
    el.style.right = 'auto';
  }

  function elementDragTouch(e) {
    var touch = e.touches[0];
    pos1 = pos3 - touch.clientX; pos2 = pos4 - touch.clientY;
    pos3 = touch.clientX; pos4 = touch.clientY;
    el.style.top = (el.offsetTop - pos2) + "px";
    el.style.left = (el.offsetLeft - pos1) + "px";
    el.style.right = 'auto';
  }

  function closeDragElement() {
    document.onmouseup = null; document.onmousemove = null;
    document.ontouchend = null; document.ontouchmove = null;
  }
}

makeDraggable(document.getElementById('measurePanel'));
makeDraggable(document.getElementById('pointInfoPopup'));
L.DomEvent.disableClickPropagation(document.getElementById('measurePanel'));
L.DomEvent.disableClickPropagation(document.getElementById('pointInfoPopup'));
L.DomEvent.disableClickPropagation(document.getElementById('sidebar'));

/* ===============================
   KEYBOARD SHORTCUTS
   =============================== */
document.addEventListener('keydown', function(e) {
  // Ctrl+F: Focus search
  if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
    e.preventDefault();
    searchInput.focus();
  }
  // Escape: Close panels
  if (e.key === 'Escape') {
    searchResults.classList.remove('active');
    hidePointInfoPopup();
    sidebar.classList.add('collapsed');
  }
});

/* ===============================
   ZOOM LEVEL INDICATOR
   =============================== */
var zoomValueEl = document.getElementById('zoomValue');
var zoomIndicator = document.getElementById('zoomIndicator');

function updateZoomIndicator() {
  var zoom = map.getZoom();
  zoomValueEl.textContent = zoom;
  // Brief highlight animation on zoom change
  zoomIndicator.style.transform = 'scale(1.05)';
  setTimeout(function() {
    zoomIndicator.style.transform = 'scale(1)';
  }, 200);
}

map.on('zoomend', updateZoomIndicator);
updateZoomIndicator();

/* ===============================
   KEYBOARD HINT (show briefly on idle)
   =============================== */
var kbdHint = document.getElementById('kbdHint');
var kbdHintTimer = null;

function showKbdHint() {
  kbdHint.classList.add('visible');
  clearTimeout(kbdHintTimer);
  kbdHintTimer = setTimeout(function() {
    kbdHint.classList.remove('visible');
  }, 4000);
}

// Show hint 3 seconds after page load, then auto-hide
setTimeout(showKbdHint, 3000);

// Show hint when mouse is idle for 8 seconds
var mouseIdleTimer = null;
document.addEventListener('mousemove', function() {
  clearTimeout(mouseIdleTimer);
  mouseIdleTimer = setTimeout(showKbdHint, 8000);
});

/* ===============================
   INITIAL WELCOME TOAST
   =============================== */
setTimeout(function() {
  showToast('Welcome to Central Chanda Geospatial Database', 'info', 4000);
}, 1000);
