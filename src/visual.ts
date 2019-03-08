/*
 *  Power BI Visual CLI
 *
 *  Copyright (c) Microsoft Corporation
 *  All rights reserved.
 *  MIT License
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the ""Software""), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 */

module powerbi.extensibility.visual {
    "use strict";
    export class Visual implements IVisual {
        private target: HTMLElement;
        private map: L.Map;
        private icon: L.DivIcon;
        private visualSettings: VisualSettings;
        private baseMapLayer: L.TileLayer;
        private fGroup: L.FeatureGroup;


        constructor(options: VisualConstructorOptions) {
            debugger;
            console.log('Visual constructor', options);
            this.target = options.element;
            this.target.style.width = "100%";
            this.target.style.height = "100%";
            if (typeof document !== "undefined") {
                this.initMap();
                this.initIcon();
            }
        }

        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {
            const settings: VisualSettings = this.visualSettings ||
            VisualSettings.getDefault() as VisualSettings;

            return VisualSettings.enumerateObjectInstances(settings, options);
        }

        /**
         * Handle updates. (Resize / Data selection / Formatting options)
         * 
         * @param options 
         */
        public update(options: VisualUpdateOptions) {
            debugger;
            let dataView: DataView = options.dataViews[0];
            
            this.updateBaseLayer(dataView);
            
            if (dataView.table) {
                this.updateMarkers(dataView.table);
            }
        }

        private updateMarkers(table: DataViewTable): void {
            debugger;
            let markers = [];
            table.rows.forEach((row) => {
                let lat: number = parseFloat(row[1].toString());
                let long: number = parseFloat(row[2].toString());
                let latLong = L.latLng(lat, long);
                let marker: L.Marker = new L.Marker(latLong);
                let markerText = "";
                row.forEach((item, index) => {
                    markerText += table.columns[index].displayName + ": " + item + "<br/>";
                });
                marker.bindPopup(markerText);
                marker.setIcon(this.icon);
                markers.push(marker);
            });
            if (this.fGroup) {
                this.map.removeLayer(this.fGroup);
            }
            this.fGroup = new L.FeatureGroup(markers).addTo(this.map);
        }

        private updateBaseLayer(dataView: DataView): void {
            this.visualSettings = VisualSettings.parse<VisualSettings>(dataView);
            this.map.removeLayer(this.baseMapLayer);
            this.baseMapLayer = L.tileLayer(this.visualSettings.map.baseLayer).addTo(this.map);
        }

        private initMap(): void {
            const map: HTMLElement = document.createElement("div");
            map.setAttribute("id", "map")
            this.target.appendChild(map);
            this.map = L.map(map).setView([0, 0], 2);
            map.style.width = "100%";
            map.style.height = "100%";      
            this.baseMapLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(this.map);
        }

        private initIcon(): void {
            this.icon = new L.DivIcon({
                className: 'div-icon',
                iconSize: [25,41],
                iconAnchor: [12, 41],
                popupAnchor: [0,-41]
            });
        }
    }
}