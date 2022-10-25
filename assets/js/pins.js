/* eslint-disable max-len */
class Pin {

    constructor(preliminary) {
        this.lat = preliminary.lat;
        this.lng = preliminary.lng;
        this.id = preliminary.id || this.generateHash(`${this.lat}_${this.lng}_${Date.now()}`);
        this.title = preliminary.title || Language.get('map.user_pins.default_title');
        this.rent = preliminary.rent || Language.get('map.user_pins.default_rent');
        this.available = preliminary.available || Language.get('map.user_pins.default_available');
        this.description = preliminary.description || Language.get('map.user_pins.default_desc');
        this.icon = preliminary.icon || 'pin';
        this.color = preliminary.color || 'orange';
    }

    generateHash(str) {
        let hash = 0;

        if (str.length === 0) return hash;

        for (let i = 0, l = str.length; i < l; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash |= 0;
        }
        return hash;
    }

    updateMarkerContent() {
        let snippet = $(`
      <div>
        <h1 id="${this.id}_name">${this.title}</h1>
        <h1 id="${this.id}_rent">${this.rent}</h1>
        <h1 id="${this.id}_available">${this.available}</h1>
        <p id="${this.id}_desc">${this.description}</p>
      </div>
    `);

        if (Settings.isPinsEditingEnabled) {
            // const markerIcons = ['outlaw_dynamic_homestead', 'pin', 'random', 'shovel', 'magnet', 'flower', 'bottle', 'arrowhead', 'egg', 'cups', 'pentacles', 'swords', 'wands', 'coin', 'heirlooms', 'fast_travel', 'bracelet', 'earring', 'necklace', 'ring', 'nazar', 'treasure', 'camp', 'harrietum'];
            const markerIcons = ['outlaw_dynamic_homestead', 'outlaw_dynamic_camp', 'pin'];
            // const markerColors = ['aquagreen', 'beige', 'black', 'blue', 'brown', 'cadetblue', 'darkblue', 'darkgreen', 'darkorange', 'darkpurple', 'darkred', 'gray', 'green', 'lightblue', 'lightgray', 'lightgreen', 'lightorange', 'lightred', 'orange', 'pink', 'purple', 'red', 'white', 'yellow'];
            const markerColors = ['white', 'lightgray', 'red', 'darkgreen', 'blue'];
            const markerIconSelect = $('<select>').attr('id', `${this.id}_icon`).addClass('marker-popup-pin-input-icon');
            const markerColorSelect = $('<select>').attr('id', `${this.id}_color`).addClass('marker-popup-pin-input-color');

            markerColors.forEach(color => {
                const option = $('<option></option>')
                    .addClass(`pin-color ${color}`)
                    .attr('value', color)
                    .attr('data-text', `map.user_pins.color.${color}`)
                    .text(Language.get(`map.user_pins.color.${color}`));
                markerColorSelect.append(option);

                if (color === this.color) option.attr('selected', 'selected');
            });

            markerIcons.forEach(icon => {
                const option = $('<option></option>').attr('value', icon)
                    .attr('data-text', `map.user_pins.icon.${icon}`).text(Language.get(`map.user_pins.icon.${icon}`));
                markerIconSelect.append(option);
                if (icon === this.icon) option.attr('selected', 'selected');
            });

            snippet = $(`
        <div>
          <h1>
            <input id="${this.id}_name" class="marker-popup-pin-input-name" type="text" value="${this.title}"
            placeholder="${Language.get('map.user_pins.placeholder_title')}">
          </h1>
          <input id="${this.id}_rent" class="marker-popup-pin-input-name" type="text" value="${this.rent}"
            placeholder="${Language.get('map.user_pins.placeholder_rent')}">
          <input id="${this.id}_available" class="marker-popup-pin-input-name" type="text" value="${this.available}"
            placeholder="${Language.get('map.user_pins.placeholder_available')}">
          <p>
            <textarea id="${this.id}_desc" class="marker-popup-pin-input-desc" rows="5" value="${this.description}"
            placeholder="${Language.get('map.user_pins.placeholder_desc')}">${this.description}</textarea>
          </p>
          <hr class="marker-popup-pin-input-divider">
          <div style="display: grid;">
            <label for="${this.id}_icon" class="marker-popup-pin-label" data-text="map.user_pins.icon">
              ${Language.get('map.user_pins.icon')}
            </label>
            ${markerIconSelect.prop('outerHTML')}

            <label for="${this.id}_color" class="marker-popup-pin-label" data-text="map.user_pins.color">
              ${Language.get('map.user_pins.color')}
            </label>
            ${markerColorSelect.prop('outerHTML')}
          </div>
          <div style="display: grid;">
            <button type="button" class="btn btn-info save-button" data-text="map.user_pins.save">
              ${Language.get('map.user_pins.save')}
            </button>
            <button type="button" class="btn btn-danger remove-button" data-text="map.user_pins.remove">
              ${Language.get('map.user_pins.remove')}
            </button>
            <small class="popupContentDebug">
              Latitude: ${this.lat} / Longitude: ${this.lng}
            </small>
          </div>
        </div>
        `);
            snippet.find('button.save-button').on('click', () =>
                this.save($(`#${this.id}_name`).val(), $(`#${this.id}_rent`).val(), $(`#${this.id}_available`).val(), $(`#${this.id}_desc`).val(), $(`#${this.id}_icon`).val(), $(`#${this.id}_color`).val())
            );
            snippet.find('button.remove-button').on('click', () => this.remove());
        }

        return snippet[0];
    }

    save(title, rent, available, desc, icon, color) {

        console.log('1 save', Pins.pinsList)

        this.title = title;
        this.rent = rent;
        this.available = available;
        this.description = desc;
        this.icon = icon;
        this.color = color;

        Pins.layer.removeLayer(
            Object.keys(Pins.layer._layers)
            .find(marker => {
                this.lat = Pins.layer._layers[marker]._latlng.lat;
                this.lng = Pins.layer._layers[marker]._latlng.lng;
                return Pins.layer._layers[marker].options.id === this.id;
            }));

        Pins.pinsList = Pins.pinsList.filter(_pin => _pin.id !== this.id);

        console.log('134 add pin')
        Pins.addPin(JSON.parse(JSON.stringify(this)));


        console.log('138 save')
        Pins.save();


    }

    remove() {
        let id = this.id;
        Pins.pinsList = Pins.pinsList.filter(function(pin) {
            return pin.id !== id;
        });

        Pins.layer.removeLayer(Object.keys(Pins.layer._layers).find(marker => Pins.layer._layers[marker].options.id === this.id));

        console.log('152 save')
        Pins.save();
    }
}

class Pins {
    static init() {

        console.log('INIT')

        this.loadedPins = [];
        this.layer = L.layerGroup();

        $('#pins-place-mode').on('change', function() {
            Settings.isPinsPlacingEnabled = $('#pins-place-mode').prop('checked');
            Pins.onMap = true;
        });

        $('#pins-edit-mode').on('change', function() {
            Settings.isPinsEditingEnabled = $('#pins-edit-mode').prop('checked');
            Pins.onMap = true;
            Pins.loadPins();
        });

        $('#pins-place-new').on('click', function() {
            Pins.onMap = true;
            console.log('178 addPinToCenter')
            Pins.addPinToCenter();
            console.log('179 save')
            Pins.save();
        });

        $('#open-remove-all-pins-modal').on('click', function() {
            $('#remove-all-pins-modal').modal();
        });

        $('#remove-all-pins').on('click', function() {
            Pins.removeAllPins();
        });

        $('#pins-export').on('click', function() {
            try {
                Pins.exportPins();
            } catch (error) {
                console.error(error);
                alert(Language.get('alerts.feature_not_supported'));
            }
        });

        $('#pins-import').on('click', function() {
            try {
                let file = $('#pins-import-file').prop('files')[0];
                let fallback = false;

                if (!file) {
                    alert(Language.get('alerts.file_not_found'));
                    return;
                }

                try {
                    file.text().then((text) => {
                        Pins.importPins(text);
                    });
                } catch (error) {
                    fallback = true;
                }

                if (fallback) {
                    const reader = new FileReader();

                    reader.addEventListener('loadend', (e) => {
                        const text = e.srcElement.result;
                        Pins.importPins(text);
                    });

                    reader.readAsText(file);
                }
            } catch (error) {
                console.error(error);
                alert(Language.get('alerts.feature_not_supported'));
            }
        });

        $('#pins-place-mode').prop('checked', Settings.isPinsPlacingEnabled);
        $('#pins-edit-mode').prop('checked', Settings.isPinsEditingEnabled);

        this.context = $('.menu-option[data-type=user_pins]');
        this.context.toggleClass('disabled', !this.onMap)
            .on('click', () => this.onMap = !this.onMap)
            .translate();

        console.log('.before')
        return Loader.promises['pinned-items'].consumeJson(data => {

            console.log('after', data)

            data.forEach(item => {
                // this.locations.push(new Camp(item));
                // this.quickParams.push(item.key);
                if (item)
                    this.loadedPins.push(item)
                // console.log(item)
            });
            console.info('%c[Pinned-Items] Loaded!', 'color: #bada55; background: #242424');
            // Menu.reorderMenu(this.context);

            this.loadPins();

            if (this.onMap)
                this.layer.addTo(MapBase.map);

        });

    }

    static loadPins() {
        this.layer.clearLayers();
        this.pinsList = [];

        // console.log('loadedPins', this.loadedPins)

        //Check if exists old pins data
        // let oldPinnedItems = localStorage.getItem('pinned-items');
        // if (oldPinnedItems != null) {
        //     oldPinnedItems.split(';').forEach(oldItem => {
        //         if (oldItem === '') return;
        //         const properties = oldItem.split(':');
        //         this.addPin(JSON.parse(`{"lat": ${properties[0]}, "lng": ${properties[1]}, "id": ${properties[2]}, "title": "${properties[3]}", "description": "${properties[4]}", "icon": "${properties[5]}", "color": "red"}`));
        //     });
        // }

        // // old method through local storage
        // if (Pins.isValidJSON(localStorage.getItem('rdo.pinned-items'))) {
        //     JSON.parse(localStorage.getItem('rdo.pinned-items')).forEach(pinnedItem => {
        //         this.addPin(pinnedItem);
        //     });
        // }

        // new method from file
        if (this.loadedPins.length) {
            this.loadedPins.forEach(pinnedItem => {
                console.log('292 add pin')
                this.addPin(pinnedItem);
            });
        }
        // console.log("296 SAVE")
        this.save();
        console.log('loadedPins', this.loadedPins)

        
    }

    static renderList(){
        console.log('renderList', this.pinsList)

        var tag = document.createElement("div");
        // var text = document.createTextNode("Tutorix is the best e-learning platform");

        var listElement = document.createElement('ul');
        this.pinsList.forEach(item => {
            var listItem = document.createElement('li');

            // Add the item text
            listItem.innerHTML = item.title;

            // Add listItem to the listElement
            listElement.appendChild(listItem);
        });

        tag.replaceWith(listElement);
        var element = document.getElementById("pin-list");
        element.appendChild(tag);
    }

    static addPin(data) {
        console.log('addPin function')
        const marker = new Pin(data);
        if (!this.pinsList)
            this.pinsList = [];
        // console.log('pinslist', this.pinsList)
        this.pinsList.push(marker);

        const shadow = Settings.isShadowsEnabled ?
            `<img class="shadow" width="${35 * Settings.markerSize}" height="${16 * Settings.markerSize}" src="./assets/images/markers-shadow.png" alt="Shadow">` : '';
        const tempMarker = L.marker([marker.lat, marker.lng], {
            opacity: Settings.markerOpacity,
            icon: new L.DivIcon.DataMarkup({
                iconSize: [35 * Settings.markerSize, 45 * Settings.markerSize],
                iconAnchor: [17 * Settings.markerSize, 42 * Settings.markerSize],
                popupAnchor: [1 * Settings.markerSize, -29 * Settings.markerSize],
                html: `<div>
          <img class="icon" src="assets/images/icons/${marker.icon}.png" alt="Icon">
          <img class="background" src="assets/images/icons/marker_${MapBase.colorOverride || marker.color}.png" alt="Background">
          ${shadow}
        </div>
        <div class="title">${marker.title}</div>
        `,
                marker: this.key,
                tippy: marker.title,
            }),
            id: marker.id,
            draggable: Settings.isPinsEditingEnabled,
        });
        tempMarker.bindPopup(marker.updateMarkerContent.bind(marker, () => this.onMap = false), { minWidth: 300, maxWidth: 400 });

        Pins.layer.addLayer(tempMarker);
        if (Settings.isMarkerClusterEnabled && !Settings.isPinsEditingEnabled)
            Layers.oms.addMarker(tempMarker);
        
            console.log("358", data, this.pinsList.length, this.loadedPins.length)
       
        // if(this.pinsList.length == this.loadedPins.length || this.pinsList.length > this.loadedPins.length){
            //Pins.save();
            console.log("355 save", data, this.pinsList.length, this.loadedPins.length)
        // }
           
        

        tempMarker.addEventListener('dragend', function() {
            Pins.pinsList.forEach(pin => {
                
                pin.save(pin.title, pin.rent, pin.available, pin.description, pin.icon, pin.color);
            });
            console.log("364 save")
            Pins.save();
        }, { capture: false });
    }

    static addPinToCenter() {
        const center = MapBase.map.getCenter();
        console.log('373 add pin')
        Pins.addPin({ lat: center.lat, lng: center.lng });
    }

    static save() {
        console.log('386 SAVE XMLHttpRequest', this.pinsList)
        var ajax = new XMLHttpRequest();

        // console.log(this.pinsList)
        // console.log(JSON.stringify(this.pinsList))
        // console.log(encodeURIComponent(JSON.stringify(this.pinsList)))

        ajax.open('post', 'api/api.php');
        // ajax.setRequestHeader("Content-type", "application/json;charset=UTF-8");
        // ajax.send('data=' + encodeURIComponent(JSON.stringify(this.pinsList)));
        ajax.send(JSON.stringify(this.pinsList));



        //localStorage.removeItem('pinned-items');
        //localStorage.setItem('rdo.pinned-items', JSON.stringify(this.pinsList));

        // this.renderList()
    }

    static importPins(text) {
        if (Pins.isValidJSON(text)) {
            // console.log(text);
            localStorage.setItem('rdo.pinned-items', text);
            this.loadPins();
        } else {
            alert(Language.get('alerts.file_not_valid'));
            // console.log(text);
        }
    }

    static exportPins() {
        const text = localStorage.getItem('rdo.pinned-items');
        const filename = 'pinned-items.txt';

        if (text === null) {
            alert(Language.get('alerts.nothing_to_export'));
            return;
        }

        const element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', filename);

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
    }

    static isValidJSON(str) {
        try {
            if (str == null)
                return false;
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    }

    static set onMap(state) {
        if (state) {
            this.layer.addTo(MapBase.map);
            if (!MapBase.isPreviewMode)
                localStorage.setItem('rdo.pins-enabled', 'true');
            this.context.removeClass('disabled');
        } else {
            this.layer.remove();
            if (!MapBase.isPreviewMode)
                localStorage.removeItem('rdo.pins-enabled');
            this.context.addClass('disabled');
        }
        MapBase.updateTippy('pins');
    }

    static get onMap() {
        return !!localStorage.getItem('rdo.pins-enabled');
    }

    static removeAllPins() {
        Pins.pinsList = [];
        Object.keys(Pins.layer._layers).forEach(pin => {
            Pins.layer.removeLayer(pin);
        });
        Pins.save();
    }
}