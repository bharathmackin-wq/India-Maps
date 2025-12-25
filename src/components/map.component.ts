
import { Component, ElementRef, viewChild, afterNextRender, output, signal, OnDestroy, input, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as d3 from 'd3';
import { City } from '../app.component';

export type MapMode = 'political' | 'terrain' | 'satellite';

const DEFAULT_TIER_1 = [
  'Mumbai', 'New Delhi', 'Bengaluru', 'Chennai', 'Kolkata', 'Hyderabad', 'Ahmedabad', 'Pune'
];

// Major Indian Cities [Longitude, Latitude]
const CITIES: City[] = [
  // Andhra Pradesh
  { name: 'Visakhapatnam', coords: [83.2185, 17.6868] },
  { name: 'Vijayawada', coords: [80.6480, 16.5062] },
  { name: 'Tirupati', coords: [79.4192, 13.6288] },
  { name: 'Amaravati', coords: [80.5158, 16.5730] },
  
  // Arunachal Pradesh
  { name: 'Itanagar', coords: [93.6053, 27.0844] },

  // Assam
  { name: 'Guwahati', coords: [91.7362, 26.1158] },
  { name: 'Silchar', coords: [92.7757, 24.8333] },
  { name: 'Dibrugarh', coords: [94.9120, 27.4728] },

  // Bihar
  { name: 'Patna', coords: [85.1376, 25.5941] },
  { name: 'Gaya', coords: [85.0002, 24.7914] },
  { name: 'Muzaffarpur', coords: [85.3910, 26.1209] },

  // Chhattisgarh
  { name: 'Raipur', coords: [81.6296, 21.2514] },
  { name: 'Bhilai', coords: [81.3509, 21.1938] },
  { name: 'Bilaspur', coords: [82.1409, 22.0797] },

  // Goa
  { name: 'Panaji', coords: [73.8278, 15.4909] },
  { name: 'Vasco da Gama', coords: [73.8128, 15.3991] },

  // Gujarat
  { name: 'Ahmedabad', coords: [72.5714, 23.0225] },
  { name: 'Surat', coords: [72.8311, 21.1702] },
  { name: 'Vadodara', coords: [73.1812, 22.3072] },
  { name: 'Rajkot', coords: [70.8022, 22.3039] },
  { name: 'Gandhinagar', coords: [72.6369, 23.2156] },

  // Haryana
  { name: 'Gurugram', coords: [77.0266, 28.4595] },
  { name: 'Faridabad', coords: [77.3178, 28.4089] },

  // Himachal Pradesh
  { name: 'Shimla', coords: [77.1734, 31.1048] },
  { name: 'Manali', coords: [77.1892, 32.2432] },
  { name: 'Dharamshala', coords: [76.3213, 32.2190] },

  // Jharkhand
  { name: 'Ranchi', coords: [85.3096, 23.3441] },
  { name: 'Jamshedpur', coords: [86.2029, 22.8046] },
  { name: 'Dhanbad', coords: [86.4304, 23.7957] },

  // Karnataka
  { name: 'Bengaluru', coords: [77.5946, 12.9716] },
  { name: 'Mysuru', coords: [76.6394, 12.2958] },
  { name: 'Mangaluru', coords: [74.8560, 12.9141] },
  { name: 'Hubballi', coords: [75.1240, 15.3647] },

  // Kerala
  { name: 'Thiruvananthapuram', coords: [76.9366, 8.5241] },
  { name: 'Kochi', coords: [76.2711, 9.9312] },
  { name: 'Kozhikode', coords: [75.7804, 11.2588] },

  // Madhya Pradesh
  { name: 'Bhopal', coords: [77.4126, 23.2599] },
  { name: 'Indore', coords: [75.8577, 22.7196] },
  { name: 'Gwalior', coords: [78.1828, 26.2183] },
  { name: 'Jabalpur', coords: [79.9199, 23.1815] },

  // Maharashtra
  { name: 'Mumbai', coords: [72.8777, 19.0760] },
  { name: 'Pune', coords: [73.8567, 18.5204] },
  { name: 'Nagpur', coords: [79.0882, 21.1458] },
  { name: 'Nashik', coords: [73.7898, 19.9975] },
  { name: 'Aurangabad', coords: [75.3433, 19.8762] },

  // Manipur
  { name: 'Imphal', coords: [93.9368, 24.8170] },

  // Meghalaya
  { name: 'Shillong', coords: [91.8933, 25.5788] },

  // Mizoram
  { name: 'Aizawl', coords: [92.7176, 23.7307] },

  // Nagaland
  { name: 'Kohima', coords: [94.1086, 25.6751] },
  { name: 'Dimapur', coords: [93.7266, 25.9095] },

  // Odisha
  { name: 'Bhubaneswar', coords: [85.8245, 20.2961] },
  { name: 'Cuttack', coords: [85.8765, 20.4625] },
  { name: 'Rourkela', coords: [84.8034, 22.2604] },
  { name: 'Puri', coords: [85.8312, 19.8135] },

  // Punjab
  { name: 'Chandigarh', coords: [76.7794, 30.7333] },
  { name: 'Amritsar', coords: [74.8723, 31.6340] },
  { name: 'Ludhiana', coords: [75.8573, 30.9010] },
  { name: 'Jalandhar', coords: [75.5762, 31.3260] },

  // Rajasthan
  { name: 'Jaipur', coords: [75.7873, 26.9124] },
  { name: 'Jodhpur', coords: [73.0243, 26.2389] },
  { name: 'Udaipur', coords: [73.7125, 24.5854] },
  { name: 'Kota', coords: [75.8317, 25.2138] },
  { name: 'Jaisalmer', coords: [70.9229, 26.9157] },

  // Sikkim
  { name: 'Gangtok', coords: [88.6138, 27.3314] },

  // Tamil Nadu
  { name: 'Chennai', coords: [80.2707, 13.0827] },
  { name: 'Coimbatore', coords: [76.9558, 11.0168] },
  { name: 'Madurai', coords: [78.1198, 9.9252] },
  { name: 'Tiruchirappalli', coords: [78.7047, 10.7905] },
  { name: 'Salem', coords: [78.1460, 11.6643] },

  // Telangana
  { name: 'Hyderabad', coords: [78.4867, 17.3850] },
  { name: 'Warangal', coords: [79.5946, 17.9689] },

  // Tripura
  { name: 'Agartala', coords: [91.2868, 23.8315] },

  // Uttar Pradesh
  { name: 'Lucknow', coords: [80.9462, 26.8467] },
  { name: 'Kanpur', coords: [80.3319, 26.4499] },
  { name: 'Varanasi', coords: [82.9739, 25.3176] },
  { name: 'Agra', coords: [78.0081, 27.1767] },
  { name: 'Prayagraj', coords: [81.8463, 25.4358] },
  { name: 'Noida', coords: [77.3910, 28.5355] },
  { name: 'Ghaziabad', coords: [77.4194, 28.6692] },

  // Uttarakhand
  { name: 'Dehradun', coords: [78.0322, 30.6288] },
  { name: 'Haridwar', coords: [78.1642, 29.9457] },
  { name: 'Nainital', coords: [79.4150, 29.3803] },

  // West Bengal
  { name: 'Kolkata', coords: [88.3639, 22.5726] },
  { name: 'Siliguri', coords: [88.3953, 26.7271] },
  { name: 'Durgapur', coords: [87.3219, 23.5204] },
  { name: 'Darjeeling', coords: [88.2627, 27.0410] },

  // UTs
  { name: 'New Delhi', coords: [77.2090, 28.6139] },
  { name: 'Srinagar', coords: [74.7973, 34.0837] }, // J&K
  { name: 'Jammu', coords: [74.8723, 32.7266] }, // J&K
  { name: 'Leh', coords: [77.5771, 34.1526] }, // Ladakh
  { name: 'Kargil', coords: [76.1011, 34.5539] }, // Ladakh
  { name: 'Port Blair', coords: [92.7265, 11.6234] }, // Andaman
  { name: 'Kavaratti', coords: [72.6369, 10.5669] }, // Lakshadweep
  { name: 'Puducherry', coords: [79.8083, 11.9416] }
];

// Routes for ships [StartLng, StartLat] -> [EndLng, EndLat]
const SEA_ROUTES = [
  [[65, 22], [71, 8]],     // Arabian Sea High -> Low
  [[72, 6], [62, 18]],     // Arabian Sea Low -> High
  [[89, 21], [83, 7]],     // Bay of Bengal High -> Low
  [[82, 6], [92, 16]],     // Bay of Bengal Low -> High
  [[68, 5], [90, 5.5]],    // Southern Crossing W -> E
  [[92, 4.5], [65, 4]],    // Southern Crossing E -> W
  [[70, 15], [58, 12]],    // Mumbai Outbound
  [[85, 10], [95, 10]]     // Eastbound
];

interface Ship {
  id: number;
  routeIndex: number;
  t: number; // Progress 0 -> 1
  speed: number;
}

// Heuristic Region Mapping for Terrain Colors
const REGIONS: Record<string, string> = {
  // Mountains (White/Grey/Brown)
  'Jammu and Kashmir': 'mountain',
  'Ladakh': 'mountain',
  'Himachal Pradesh': 'mountain',
  'Uttarakhand': 'mountain',
  'Sikkim': 'mountain',
  'Arunachal Pradesh': 'mountain',

  // Desert/Arid (Sand/Orange)
  'Rajasthan': 'desert',
  'Gujarat': 'desert',

  // Plains/Central (Light Green/Beige)
  'Punjab': 'plains',
  'Haryana': 'plains',
  'Uttar Pradesh': 'plains',
  'Madhya Pradesh': 'plateau',
  'Bihar': 'plains',
  'Jharkhand': 'plateau',
  'Chhattisgarh': 'plateau',
  'Telangana': 'plateau',
  'Delhi': 'plains',

  // Coastal/Tropical (Green)
  'Maharashtra': 'coastal',
  'Goa': 'coastal',
  'Karnataka': 'coastal',
  'Kerala': 'tropical',
  'Tamil Nadu': 'coastal',
  'Andhra Pradesh': 'coastal',
  'Odisha': 'coastal',
  'West Bengal': 'delta',
  
  // Northeast (Forest Green)
  'Assam': 'forest',
  'Meghalaya': 'forest',
  'Nagaland': 'forest',
  'Manipur': 'forest',
  'Mizoram': 'forest',
  'Tripura': 'forest',
};

@Component({
  selector: 'app-map',
  imports: [CommonModule],
  template: `
    <div 
        class="relative w-full h-full flex items-center justify-center overflow-hidden transition-colors duration-700" 
        #mapContainer
        [style.background-color]="getBackgroundColor()"
    >
      @if (loading()) {
        <div class="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
           <div class="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
           <p class="text-orange-500 animate-pulse font-medium">Loading India Map...</p>
        </div>
      }
      <!-- Error State -->
      @if (error()) {
         <div class="absolute inset-0 z-10 flex flex-col items-center justify-center text-red-500 dark:text-red-400 p-4 text-center bg-white dark:bg-slate-900">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12 mb-2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
            <p>Could not load map data.</p>
            <button (click)="retry()" class="mt-4 px-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm transition-colors">Retry</button>
         </div>
      }
      <div #svgContainer class="w-full h-full flex items-center justify-center" [class.cursor-crosshair]="isMultiSelect()"></div>
      
      <!-- Controls Container -->
      <div class="absolute top-4 right-4 flex flex-col gap-2 items-end pointer-events-none">
        <!-- Re-enable pointer events for buttons -->
        <div class="pointer-events-auto flex flex-col gap-2 items-end">
            <!-- Multi-Select Toggle -->
            <button 
            (click)="toggleMultiSelect.emit()" 
            class="flex items-center gap-2 px-4 py-2 rounded-full shadow-lg border transition-all duration-200"
            [class.bg-orange-500]="isMultiSelect()"
            [class.text-white]="isMultiSelect()"
            [class.border-orange-600]="isMultiSelect()"
            [class.bg-white]="!isMultiSelect()"
            [class.dark:bg-slate-800]="!isMultiSelect()"
            [class.text-slate-700]="!isMultiSelect()"
            [class.dark:text-slate-200]="!isMultiSelect()"
            [class.border-slate-200]="!isMultiSelect()"
            [class.dark:border-slate-700]="!isMultiSelect()"
            [class.hover:bg-slate-50]="!isMultiSelect()"
            [class.dark:hover:bg-slate-700]="!isMultiSelect()"
            >
            @if (isMultiSelect()) {
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="size-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                <span class="font-bold text-sm">Done Selecting</span>
            } @else {
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                </svg>
                <span class="font-medium text-sm">Multi-Select</span>
            }
            </button>
            
            <div class="flex gap-2 relative">
                <!-- Top Tier Filter Toggle -->
                <div class="flex bg-white dark:bg-slate-800 rounded-full shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <button
                        (click)="toggleTopTier()"
                        class="flex items-center justify-center p-2 transition-all duration-200"
                        [class.bg-purple-600]="showTopTierOnly()"
                        [class.text-white]="showTopTierOnly()"
                        [class.text-slate-600]="!showTopTierOnly()"
                        [class.dark:text-slate-300]="!showTopTierOnly()"
                        [class.hover:bg-slate-100]="!showTopTierOnly()"
                        [class.dark:hover:bg-slate-700]="!showTopTierOnly()"
                        title="Show Top Tier Cities Only"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z" />
                        </svg>
                    </button>
                    <!-- Settings Button for Top Tier -->
                    <button
                        (click)="showCityManager.set(true)"
                        class="flex items-center justify-center px-2 border-l border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400"
                        title="Manage Cities"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 0 1 1.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 0 1-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 0 1-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 0 1 .12-1.45l.773-.773a1.125 1.125 0 0 1 1.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894Z" />
                            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        </svg>
                    </button>
                </div>

                <!-- View Mode Toggle (Cycle: Political -> Terrain -> Satellite) -->
                <button
                    (click)="cycleViewMode()"
                    class="flex items-center justify-center gap-2 px-3 py-2 rounded-full shadow-lg border transition-all duration-200 min-w-[40px]"
                    [class.bg-emerald-600]="viewMode() === 'terrain'"
                    [class.text-white]="viewMode() === 'terrain'"
                    [class.border-emerald-700]="viewMode() === 'terrain'"
                    [class.bg-indigo-900]="viewMode() === 'satellite'"
                    [class.text-indigo-100]="viewMode() === 'satellite'"
                    [class.border-indigo-800]="viewMode() === 'satellite'"
                    [class.bg-white]="viewMode() === 'political'"
                    [class.dark:bg-slate-800]="viewMode() === 'political'"
                    [class.text-slate-600]="viewMode() === 'political'"
                    [class.dark:text-slate-300]="viewMode() === 'political'"
                    [class.border-slate-200]="viewMode() === 'political'"
                    [class.dark:border-slate-700]="viewMode() === 'political'"
                    title="Change Map View"
                >
                    @switch (viewMode()) {
                        @case ('political') {
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0Z" />
                            </svg>
                            <span class="text-xs font-semibold hidden md:inline">Political</span>
                        }
                        @case ('terrain') {
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-5">
                                <path fill-rule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
                            </svg>
                            <span class="text-xs font-semibold hidden md:inline">Terrain</span>
                        }
                        @case ('satellite') {
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
                            </svg>
                            <span class="text-xs font-semibold hidden md:inline">Satellite</span>
                        }
                    }
                </button>

                <!-- Auto Zoom Toggle -->
                <button
                    (click)="toggleZoomOnClick()"
                    class="flex items-center justify-center p-2 rounded-full shadow-lg border transition-all duration-200"
                    [class.bg-blue-500]="zoomOnClick()"
                    [class.text-white]="zoomOnClick()"
                    [class.border-blue-600]="zoomOnClick()"
                    [class.bg-white]="!zoomOnClick()"
                    [class.dark:bg-slate-800]="!zoomOnClick()"
                    [class.text-slate-600]="!zoomOnClick()"
                    [class.dark:text-slate-300]="!zoomOnClick()"
                    [class.border-slate-200]="!zoomOnClick()"
                    [class.dark:border-slate-700]="!zoomOnClick()"
                    title="Toggle Auto-Zoom on Click"
                >
                    @if (zoomOnClick()) {
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="size-5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
                        </svg>
                    } @else {
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM13.5 10.5h-6" />
                        </svg>
                    }
                </button>

                <!-- Reset Zoom Button -->
                <button 
                    (click)="resetZoom()" 
                    class="flex items-center justify-center p-2 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full shadow-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    title="Reset Zoom"
                >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15h4.5M9 15l5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h-4.5M15 15v4.5M15 15l-5.25 5.25" />
                </svg>
                </button>
            </div>
        </div>
      </div>
      
      <!-- Top Tier Manager Modal -->
      @if (showCityManager()) {
          <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn" (click)="showCityManager.set(false)">
            <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[80vh]" (click)="$event.stopPropagation()">
               <!-- Header -->
               <div class="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                  <h3 class="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5 text-purple-600 dark:text-purple-400">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z" />
                     </svg>
                     Manage Top Tier Cities
                  </h3>
                  <button (click)="showCityManager.set(false)" class="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  </button>
               </div>

               <!-- List -->
               <div class="overflow-y-auto p-4 flex-1 space-y-2 bg-white dark:bg-slate-900">
                  @if (tier1Cities().length === 0) {
                      <div class="text-center text-slate-400 py-4 text-sm">No cities in the top tier list.</div>
                  }
                  @for (city of tier1Cities(); track city) {
                     <div class="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 group hover:border-purple-200 dark:hover:border-purple-900 transition-colors">
                        <span class="font-medium text-slate-700 dark:text-slate-200">{{city}}</span>
                        <button (click)="removeTopTierCity(city)" class="text-slate-400 hover:text-red-500 transition-colors p-1" title="Remove from list">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
                                <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                            </svg>
                        </button>
                     </div>
                  }
               </div>

               <!-- Add New -->
               <div class="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                  <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Add City to List</label>
                  <div class="relative">
                      <select 
                        #citySelect 
                        (change)="addTopTierCity(citySelect.value); citySelect.value = ''" 
                        class="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none appearance-none cursor-pointer"
                      >
                         <option value="" disabled selected>Select a city...</option>
                         @for (city of availableCities(); track city.name) {
                            <option [value]="city.name">{{city.name}}</option>
                         }
                      </select>
                      <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-500">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
                            <path fill-rule="evenodd" d="M10 3a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02L10 4.852 7.3 7.76a.75.75 0 01-1.1-1.02l3.25-3.5A.75.75 0 0110 3zm-3.76 9.2a.75.75 0 011.06.04l2.7 2.908 2.7-2.908a.75.75 0 111.1 1.02l-3.25 3.5a.75.75 0 01-1.1 0l-3.25-3.5a.75.75 0 01.04-1.06z" clip-rule="evenodd" />
                        </svg>
                      </div>
                  </div>
               </div>
            </div>
          </div>
      }
      
      <!-- Legend/Credits -->
      <div class="absolute bottom-4 left-4 pointer-events-none">
        <h1 class="text-4xl font-black text-slate-300 dark:text-slate-800 tracking-tighter select-none opacity-50 dark:opacity-40 transition-colors">INDIA</h1>
      </div>
      
      <!-- Zoom Hints -->
      <div class="absolute bottom-4 right-4 text-xs text-slate-400 dark:text-slate-500 pointer-events-none hidden md:block">
        Scroll to Zoom • Drag to Pan
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; transform: scale(0.95); }
        to { opacity: 1; transform: scale(1); }
    }
    .animate-fadeIn {
        animation: fadeIn 0.2s ease-out forwards;
    }
    
    ::ng-deep .city-pin {
      animation: city-blink 3s ease-in-out infinite;
    }
    
    @keyframes city-blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    ::ng-deep .state-path {
      transition: fill 0.3s ease, stroke 0.3s ease;
      /* Ensures border width remains constant visually even when scaling the group, 
         making borders look "clean" at high zoom levels */
      vector-effect: non-scaling-stroke; 
    }

    ::ng-deep .state-marching-ants {
      stroke-dasharray: 8; 
      stroke-linecap: round;
      animation: marching-ants 1s linear infinite;
    }

    @keyframes marching-ants {
      from { stroke-dashoffset: 0; }
      to { stroke-dashoffset: 16; }
    }

    /* Ship Styling */
    ::ng-deep .ship {
      transition: transform 0.1s linear;
    }
  `]
})
export class MapComponent implements OnDestroy {
  // Outputs
  stateSelected = output<string>();
  citySelected = output<string>(); 
  toggleMultiSelect = output<void>();
  cityToggled = output<string>();
  
  // Inputs
  cityColors = input<Record<string, string>>({});
  isMultiSelect = input(false);
  selectedCities = input<string[]>([]);
  isDark = input(false);
  
  svgContainer = viewChild<ElementRef>('svgContainer');
  loading = signal(true);
  error = signal(false);
  
  // Local Settings
  zoomOnClick = signal(true);
  viewMode = signal<MapMode>('political');
  showTopTierOnly = signal(false);
  
  // Management State
  tier1Cities = signal<string[]>([]);
  showCityManager = signal(false);
  
  // Computed available cities for adding (exclude already added)
  availableCities = computed(() => {
     const current = this.tier1Cities();
     return CITIES.filter(c => !current.includes(c.name)).sort((a,b) => a.name.localeCompare(b.name));
  });
  
  private resizeObserver: ResizeObserver | null = null;
  private resizeTimeout: any = null;
  private mapData: any = null; // Store fetched data
  private activePath: any = null; // Track active D3 selection
  private cityHighlightedPath: any = null; // Track city-highlighted path
  
  // Ships
  private ships: Ship[] = [];
  private shipTimer: any = null;

  // D3 Variables for Zoom Logic
  private svg: any = null;
  private g: any = null; 
  private shipsLayer: any = null;
  private zoomBehavior: any = null;
  private path: any = null;
  private projection: any = null;
  private width = 0;
  private height = 0;

  constructor() {
    afterNextRender(() => {
      this.initMap();
      this.loadTier1Cities();
    });

    // Reactively update colors and selection state
    effect(() => {
      const colors = this.cityColors();
      const multi = this.isMultiSelect();
      const selection = this.selectedCities();
      const dark = this.isDark();
      const mode = this.viewMode();
      const topTier = this.showTopTierOnly();
      const tier1List = this.tier1Cities(); // Track changes to the list
      
      // If data is loaded, redraw cities to account for new custom cities or mode changes
      if (this.g && this.projection) {
         let visibleCities = CITIES;
         if (topTier) {
             visibleCities = CITIES.filter(c => tier1List.includes(c.name));
         }

         this.drawCities(visibleCities, this.getThemeColors(dark));
         this.updateStateColors(dark, mode);
         this.updateMapVisuals(colors, multi, selection, dark);
         // Ensure ships update if theme changes
         if (this.shipsLayer) {
           this.updateShipsVisuals();
         }
      }
    });
  }

  ngOnDestroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }
    if (this.shipTimer) {
        this.shipTimer.stop();
    }
  }

  loadTier1Cities() {
      const stored = localStorage.getItem('india_explorer_tier1');
      if (stored) {
          try {
              this.tier1Cities.set(JSON.parse(stored));
          } catch (e) {
              this.tier1Cities.set(DEFAULT_TIER_1);
          }
      } else {
          this.tier1Cities.set(DEFAULT_TIER_1);
      }
  }
  
  saveTier1Cities() {
      localStorage.setItem('india_explorer_tier1', JSON.stringify(this.tier1Cities()));
  }
  
  addTopTierCity(name: string) {
      if (!name) return;
      this.tier1Cities.update(list => {
          if (list.includes(name)) return list;
          return [...list, name].sort();
      });
      this.saveTier1Cities();
  }
  
  removeTopTierCity(name: string) {
      this.tier1Cities.update(list => list.filter(c => c !== name));
      this.saveTier1Cities();
  }

  async retry() {
    this.loading.set(true);
    this.error.set(false);
    this.mapData = null;
    this.initMap();
  }

  toggleZoomOnClick() {
    this.zoomOnClick.update(v => !v);
  }
  
  toggleTopTier() {
      this.showTopTierOnly.update(v => !v);
  }
  
  cycleViewMode() {
      const modes: MapMode[] = ['political', 'terrain', 'satellite'];
      const current = this.viewMode();
      const next = modes[(modes.indexOf(current) + 1) % modes.length];
      this.viewMode.set(next);
  }
  
  getBackgroundColor() {
      if (this.viewMode() === 'terrain') {
          return this.isDark() ? '#1e3a8a' : '#bfdbfe';
      } else if (this.viewMode() === 'satellite') {
          return '#020617'; // Deep dark space/ocean
      }
      return null; // Default handled by CSS classes (slate-50/slate-950)
  }

  async initMap() {
    const container = this.svgContainer()?.nativeElement;
    if (!container) return;

    // Observe Resize with Debounce
    if (!this.resizeObserver) {
      this.resizeObserver = new ResizeObserver(() => {
        if (this.resizeTimeout) clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(() => {
          if (this.mapData) {
            this.drawMap(container, this.mapData);
          }
        }, 150); // 150ms debounce for stability
      });
      this.resizeObserver.observe(container);
    }

    // Fetch Data if not already
    if (!this.mapData) {
      try {
        const urls = [
          'https://raw.githubusercontent.com/geohacker/india/master/state/india_telengana.geojson',
          'https://raw.githubusercontent.com/Subhash9325/GeoJson-Data-of-Indian-States/master/Indian_States'
        ];
        
        let loaded = false;
        for (const url of urls) {
            try {
                const response = await fetch(url);
                if (response.ok) {
                    this.mapData = await response.json();
                    loaded = true;
                    break;
                }
            } catch (e) {
                console.warn(`Failed to load from ${url}`, e);
            }
        }
        
        if (!loaded) throw new Error('All map sources failed');
        this.loading.set(false);
      } catch (error) {
        console.error('Error loading map:', error);
        this.loading.set(false);
        this.error.set(true);
        return;
      }
    }

    this.drawMap(container, this.mapData);
  }

  // Define colors based on theme
  private getThemeColors(isDark: boolean) {
    return {
      fillDefault: isDark ? '#334155' : '#94a3b8',
      strokeDefault: isDark ? '#94a3b8' : '#334155',
      fillHover: isDark ? '#475569' : '#64748b',
      fillActive: '#fb923c',
      strokeActive: '#c2410c',
      text: isDark ? '#f1f5f9' : '#0f172a',
      textShadow: isDark ? '0 1px 2px rgba(0,0,0,0.8), 0 0 5px rgba(0,0,0,0.8)' : '0 1px 2px rgba(255,255,255,0.8), 0 0 5px rgba(255,255,255,0.8)',
    };
  }
  
  private getRegionColor(stateName: string, isDark: boolean, mode: MapMode): string {
      const region = REGIONS[stateName] || 'plains';
      
      if (mode === 'political') {
          return isDark ? '#334155' : '#94a3b8';
      }

      // Satellite Mode Colors (Darker, Realistic)
      if (mode === 'satellite') {
           const satColors: Record<string, string> = {
              'mountain': '#cbd5e1', // Slate 300 (Snowy/Rocky)
              'desert': '#7c2d12', // Orange 900 (Dark Earth)
              'plains': '#365314', // Lime 900 (Dark Vegetation)
              'plateau': '#451a03', // Amber 950 (Dark Soil)
              'coastal': '#14532d', // Green 900 (Deep Green)
              'tropical': '#064e3b', // Emerald 900 (Rainforest)
              'delta': '#065f46', // Emerald 800
              'forest': '#022c22', // Teal 950
          };
          return satColors[region] || '#3f3f46'; // Default Dark Grey
      }
      
      // Terrain Mode Colors (Vibrant, Schematic)
      const terrainColors: Record<string, string> = isDark ? {
          'mountain': '#57534e', // Stone 600
          'desert': '#9a3412', // Orange 800
          'plains': '#3f6212', // Lime 800
          'plateau': '#5d4037', // Brown 700ish
          'coastal': '#15803d', // Green 700
          'tropical': '#14532d', // Green 900
          'delta': '#065f46', // Emerald 800
          'forest': '#1e293b', // Slate 800
      } : {
          'mountain': '#d6d3d1', // Stone 300
          'desert': '#fdba74', // Orange 300
          'plains': '#d9f99d', // Lime 200
          'plateau': '#d4d4d8', // Zinc 300
          'coastal': '#86efac', // Green 300
          'tropical': '#4ade80', // Green 400
          'delta': '#6ee7b7', // Emerald 300
          'forest': '#a7f3d0', // Emerald 200
      };
      
      return terrainColors[region] || (isDark ? '#334155' : '#e2e8f0');
  }

  drawMap(container: HTMLElement, data: any) {
    if (!container || !data) return;

    d3.select(container).selectAll('*').remove();

    this.width = container.clientWidth;
    this.height = container.clientHeight;

    if (this.width === 0 || this.height === 0) return;

    this.svg = d3.select(container)
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', `0 0 ${this.width} ${this.height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');
    
    // Background click handler to reset zoom
    this.svg.on('click', (event: any) => {
      // If the target is the svg itself (background), reset zoom
      if (event.target === this.svg.node()) {
        this.resetZoom();
        // Optional: clear active state highlight
        if (this.activePath) {
           this.updateStateColors(this.isDark(), this.viewMode());
           this.activePath = null;
        }
        this.clearCityHighlight();
      }
    });

    this.projection = d3.geoMercator();
      
    try {
       this.projection.fitSize([this.width, this.height], data);
    } catch (e) {
       console.warn('fitSize failed, falling back to manual center');
       this.projection.center([78.9, 20.5]).scale(1000).translate([this.width/2, this.height/2]);
    }

    this.path = d3.geoPath().projection(this.projection);
    const theme = this.getThemeColors(this.isDark());
    const mode = this.viewMode();
    const topTier = this.showTopTierOnly();
    const tier1List = this.tier1Cities();

    // Main Group for Zoom
    this.g = this.svg.append('g');

    // Create Ships Layer BEFORE States so they appear on water (behind land if overlap)
    this.shipsLayer = this.g.append('g').attr('class', 'ships-layer');
    this.startShipAnimation();

    // Draw States
    this.g.selectAll('path.state-path')
      .data(data.features)
      .enter()
      .append('path')
      .attr('class', 'state-path')
      .attr('vector-effect', 'non-scaling-stroke')
      .attr('d', this.path as any)
      .attr('fill', (d: any) => {
          const name = d.properties.NAME_1 || d.properties.st_nm || d.properties.name || 'Unknown';
          return this.getRegionColor(name, this.isDark(), mode);
      }) 
      .attr('stroke', mode === 'satellite' ? '#1e293b' : theme.strokeDefault) 
      .attr('stroke-width', mode === 'satellite' ? '0.5' : '1')
      .style('cursor', 'pointer')
      .on('mouseover', (event: any, d: any) => {
        const el = d3.select(event.currentTarget);
        if (!el.classed('selected') && !el.classed('state-marching-ants')) {
           // In terrain/sat mode, just brighten the current color or darken it
           if (mode !== 'political') {
               const name = d.properties.NAME_1 || d.properties.st_nm || d.properties.name;
               const base = this.getRegionColor(name, this.isDark(), mode);
               el.attr('fill', d3.color(base)?.brighter(0.5)?.toString() || base);
           } else {
               const currentTheme = this.getThemeColors(this.isDark());
               el.attr('fill', currentTheme.fillHover);
           }
        }
      })
      .on('mouseout', (event: any, d: any) => {
         const el = d3.select(event.currentTarget);
         if (!el.classed('selected') && !el.classed('state-marching-ants')) {
             const name = d.properties.NAME_1 || d.properties.st_nm || d.properties.name;
             el.attr('fill', this.getRegionColor(name, this.isDark(), mode));
         }
      })
      .on('click', (event: any, d: any) => {
        event.stopPropagation();
        if (this.isMultiSelect()) return; 

        const stateName = d.properties.NAME_1 || d.properties.st_nm || d.properties.name || 'Unknown State';
        const currentTheme = this.getThemeColors(this.isDark());
        
        // Clear city highlight when clicking a state explicitly
        this.clearCityHighlight();
        
        if (this.activePath) {
           this.activePath
             .classed('selected', false);
           
           // Revert previous active path to its proper color
           const prevData = this.activePath.datum();
           const prevName = prevData.properties.NAME_1 || prevData.properties.st_nm || prevData.properties.name;
           
           this.activePath.attr('fill', this.getRegionColor(prevName, this.isDark(), this.viewMode()));
           
           if (this.viewMode() === 'satellite') {
               this.activePath.attr('stroke', '#1e293b').attr('stroke-width', '0.5');
           } else {
               this.activePath.attr('stroke', currentTheme.strokeDefault).attr('stroke-width', '1');
           }
        }
        
        this.activePath = d3.select(event.currentTarget);
        this.activePath
          .classed('selected', true)
          .attr('fill', currentTheme.fillActive)
          .attr('stroke', currentTheme.strokeActive)
          .attr('stroke-width', '1.5');
        
        // Zoom to the state
        if (this.zoomOnClick()) {
             this.zoomToFeature(d);
        }

        this.stateSelected.emit(stateName);
      })
      .append('title')
      .text((d: any) => d.properties.NAME_1 || d.properties.st_nm || d.properties.name);

     // Draw City Pins and Labels
     let visibleCities = CITIES;
     if (topTier) {
         visibleCities = CITIES.filter(c => tier1List.includes(c.name));
     }
     this.drawCities(visibleCities, theme);

     // Zoom
     this.zoomBehavior = d3.zoom()
        .scaleExtent([1, 8])
        .on('zoom', (event) => {
           this.g.attr('transform', event.transform);
        });
      
     this.svg.call(this.zoomBehavior);

     // Initial Update
     this.updateMapVisuals(this.cityColors(), this.isMultiSelect(), this.selectedCities(), this.isDark());
  }
  
  startShipAnimation() {
      // Init Ships
      this.ships = [
          { id: 1, routeIndex: 0, t: 0.1, speed: 0.0003 },
          { id: 2, routeIndex: 1, t: 0.6, speed: 0.0004 },
          { id: 3, routeIndex: 2, t: 0.3, speed: 0.0005 },
          { id: 4, routeIndex: 3, t: 0.8, speed: 0.0003 },
          { id: 5, routeIndex: 4, t: 0.2, speed: 0.0006 },
          { id: 6, routeIndex: 5, t: 0.7, speed: 0.0005 },
          { id: 7, routeIndex: 6, t: 0.15, speed: 0.0004 },
          { id: 8, routeIndex: 7, t: 0.45, speed: 0.0004 }
      ];

      // Draw initial ships
      this.updateShipsVisuals();

      if (this.shipTimer) this.shipTimer.stop();
      this.shipTimer = d3.timer(() => {
          this.ships.forEach(ship => {
              ship.t += ship.speed;
              if (ship.t > 1) ship.t = 0; // Loop
          });
          this.updateShipsVisuals();
      });
  }

  updateShipsVisuals() {
      if (!this.shipsLayer || !this.projection) return;
      
      const isSat = this.viewMode() === 'satellite';
      const shipColor = isSat ? '#f1f5f9' : '#0f172a'; // White in space, dark in map
      const sailColor = isSat ? '#cbd5e1' : '#64748b';

      const shipSelection = this.shipsLayer.selectAll('.ship-group')
          .data(this.ships, (d: any) => d.id);

      // Enter
      const enter = shipSelection.enter()
          .append('g')
          .attr('class', 'ship-group');
      
      // Cute Ship Icon (Scale 0.5)
      // Hull
      enter.append('path')
           .attr('d', 'M4,14 L20,14 C21,14 22,13 21,12 L19,10 L5,10 L3,12 C2,13 3,14 4,14 Z')
           .attr('class', 'hull')
           .attr('fill', shipColor);
      
      // Sail
      enter.append('path')
           .attr('d', 'M12,2 L12,9 L19,9 L12,2 Z')
           .attr('class', 'sail')
           .attr('fill', sailColor);
      
      // Mast
      enter.append('path')
           .attr('d', 'M11,2 L13,2 L13,10 L11,10 Z')
           .attr('class', 'mast')
           .attr('fill', '#475569');

      // Update positions
      shipSelection.merge(enter)
          .attr('transform', (d: any) => {
              const route = SEA_ROUTES[d.routeIndex];
              const p1 = route[0];
              const p2 = route[1];
              
              // Linear interp of lat/lng
              const lng = p1[0] + (p2[0] - p1[0]) * d.t;
              const lat = p1[1] + (p2[1] - p1[1]) * d.t;
              
              const pos = this.projection([lng, lat]);
              if (!pos) return 'translate(0,0)';
              
              // Calculate angle
              const dx = p2[0] - p1[0];
              const dy = p1[1] - p2[1]; // Lat increases upwards, but screen y increases downwards, careful
              // Actually projection handles y flip. Let's calculate screen angle.
              const pos1 = this.projection(p1);
              const pos2 = this.projection(p2);
              let angle = 0;
              if (pos1 && pos2) {
                  angle = Math.atan2(pos2[1] - pos1[1], pos2[0] - pos1[0]) * 180 / Math.PI;
              }
              
              // Add a slight bobbing effect using d.t
              const bob = Math.sin(d.t * 50) * 1.5;

              return `translate(${pos[0]}, ${pos[1] + bob}) rotate(${angle}) scale(0.6)`;
          });
          
      // Update colors if mode changes
      shipSelection.selectAll('.hull').attr('fill', shipColor);
      shipSelection.selectAll('.sail').attr('fill', sailColor);
  }
  
  clearCityHighlight() {
      if (this.cityHighlightedPath) {
        this.cityHighlightedPath.classed('state-marching-ants', false);
        this.cityHighlightedPath.style('stroke-dasharray', null); // clear inline style override if any
        
        // Reset stroke styles to defaults
        const datum = this.cityHighlightedPath.datum();
        const name = datum.properties.NAME_1 || datum.properties.st_nm || datum.properties.name;
        const theme = this.getThemeColors(this.isDark());
        const mode = this.viewMode();
        
        // Only reset if not selected (unlikely to be both selected and highlighted in this logic, but good practice)
        if (!this.cityHighlightedPath.classed('selected')) {
             if (mode === 'satellite') {
                 this.cityHighlightedPath.attr('stroke', '#1e293b').attr('stroke-width', '0.5');
             } else {
                 this.cityHighlightedPath.attr('stroke', theme.strokeDefault).attr('stroke-width', '1');
             }
             this.cityHighlightedPath.attr('fill', this.getRegionColor(name, this.isDark(), mode));
        }

        this.cityHighlightedPath = null;
      }
  }
  
  highlightStateForCity(feature: any) {
      this.clearCityHighlight();
      
      // If there is an active state selection, clear it visually so city highlight takes precedence
      if (this.activePath) {
           this.activePath.classed('selected', false);
           const prevData = this.activePath.datum();
           const prevName = prevData.properties.NAME_1 || prevData.properties.st_nm || prevData.properties.name;
           this.activePath.attr('fill', this.getRegionColor(prevName, this.isDark(), this.viewMode()));
           
           if (this.viewMode() === 'satellite') {
               this.activePath.attr('stroke', '#1e293b').attr('stroke-width', '0.5');
           } else {
               this.activePath.attr('stroke', this.getThemeColors(this.isDark()).strokeDefault).attr('stroke-width', '1');
           }
           this.activePath = null;
      }

      const statePath = this.g.selectAll('path.state-path')
        .filter((d: any) => d === feature);
        
      if (statePath.size()) {
          this.cityHighlightedPath = statePath;
          this.cityHighlightedPath.classed('state-marching-ants', true);
          // Force a visible stroke color and width for the animation
          this.cityHighlightedPath.attr('stroke', this.getThemeColors(this.isDark()).strokeActive);
          this.cityHighlightedPath.attr('stroke-width', '2'); // 2px is clearly visible with non-scaling-stroke
      }
  }

  drawCities(cities: City[], theme: any) {
    if (!this.g || !this.projection) return;
    
    // Remove existing pins and labels to redraw
    this.g.selectAll('.city-pin').remove();
    this.g.selectAll('.city-label').remove();

     // Draw City Pins
     this.g.selectAll('circle.city-pin')
       .data(cities)
       .enter()
       .append('circle')
       .attr('class', 'city-pin')
       .attr('cx', (d: any) => this.projection(d.coords as [number, number])?.[0] || 0)
       .attr('cy', (d: any) => this.projection(d.coords as [number, number])?.[1] || 0)
       .attr('r', 4)
       .attr('fill', '#ef4444') 
       .attr('stroke', '#ffffff')
       .attr('stroke-width', 1.5)
       .style('cursor', 'pointer')
       // Removed random delay to ensure simultaneous blinking
       .on('mouseover', function() {
         d3.select(this).transition().duration(200).attr('r', 8);
       })
       .on('mouseout', function(event: any, d: any) {
         d3.select(this).transition().duration(200).attr('r', 4);
       })
       .on('click', (event: any, d: any) => {
          event.stopPropagation();
          
          if (this.isMultiSelect()) {
            this.cityToggled.emit(d.name);
          } else {
            // Check if zoom is enabled
            if (this.zoomOnClick()) {
                // Check if city is inside any state and zoom to it
                const stateFeature = this.mapData.features.find((f: any) => d3.geoContains(f, d.coords));
                if (stateFeature) {
                    this.zoomToFeature(stateFeature);
                    this.highlightStateForCity(stateFeature);
                } else {
                    // Fallback: Just center on the city point
                    this.zoomToPoint(d.coords);
                    this.clearCityHighlight();
                }
            }
            this.citySelected.emit(d.name);
          }
       })
       .append('title')
       .text((d: any) => d.name);

     // Draw City Labels
     this.g.selectAll('text.city-label')
       .data(cities)
       .enter()
       .append('text')
       .attr('class', 'city-label')
       .attr('x', (d: any) => (this.projection(d.coords as [number, number])?.[0] || 0) + 6)
       .attr('y', (d: any) => (this.projection(d.coords as [number, number])?.[1] || 0) + 3)
       .text((d: any) => d.name)
       .attr('font-size', '10px')
       .attr('font-family', 'sans-serif')
       .attr('font-weight', '600')
       .attr('fill', this.viewMode() === 'satellite' ? '#f1f5f9' : theme.text)
       .style('text-shadow', theme.textShadow)
       .style('cursor', 'pointer')
       .on('click', (event: any, d: any) => {
          event.stopPropagation();
          
          if (this.isMultiSelect()) {
            this.cityToggled.emit(d.name);
          } else {
             if (this.zoomOnClick()) {
                 const stateFeature = this.mapData.features.find((f: any) => d3.geoContains(f, d.coords));
                 if (stateFeature) {
                     this.zoomToFeature(stateFeature);
                     this.highlightStateForCity(stateFeature);
                 } else {
                     this.zoomToPoint(d.coords);
                     this.clearCityHighlight();
                 }
             }
             this.citySelected.emit(d.name);
          }
       });
  }
  
  // Programmatic Zoom to Feature
  zoomToFeature(feature: any) {
    if (!this.svg || !this.zoomBehavior || !this.path) return;

    const bounds = this.path.bounds(feature);
    const dx = bounds[1][0] - bounds[0][0];
    const dy = bounds[1][1] - bounds[0][1];
    const x = (bounds[0][0] + bounds[1][0]) / 2;
    const y = (bounds[0][1] + bounds[1][1]) / 2;
    
    // Calculate scale to fit, with padding (0.9 factor)
    const scale = Math.max(1, Math.min(8, 0.9 / Math.max(dx / this.width, dy / this.height)));
    const translate = [this.width / 2 - scale * x, this.height / 2 - scale * y];

    this.svg.transition()
      .duration(750)
      .call(
        this.zoomBehavior.transform,
        d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale)
      );
  }
  
  // Programmatic Zoom to Point (Fallback)
  zoomToPoint(coords: [number, number]) {
      if (!this.svg || !this.zoomBehavior || !this.projection) return;
      
      const [x, y] = this.projection(coords);
      const scale = 4; // Arbitrary good zoom level for a city focus
      const translate = [this.width / 2 - scale * x, this.height / 2 - scale * y];
      
      this.svg.transition()
        .duration(750)
        .call(
            this.zoomBehavior.transform,
            d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale)
        );
  }
  
  // Reset Zoom
  resetZoom() {
      if (!this.svg || !this.zoomBehavior) return;
      this.svg.transition()
        .duration(750)
        .call(
            this.zoomBehavior.transform,
            d3.zoomIdentity
        );
  }

  updateStateColors(isDark: boolean, mode: MapMode) {
    if (!this.g) return;
    const theme = this.getThemeColors(isDark);
    
    // Update all non-selected, non-hovered paths
    this.g.selectAll('path.state-path')
        .each((d: any, i: number, nodes: any[]) => {
            const el = d3.select(nodes[i]);
            const name = d.properties.NAME_1 || d.properties.st_nm || d.properties.name;

            if (el.classed('selected')) {
                 // Keep selection active color
                el.attr('fill', theme.fillActive)
                  .attr('stroke', theme.strokeActive)
                  .attr('stroke-width', '1.5')
                  .style('stroke-dasharray', null);
            } else if (el.classed('state-marching-ants')) {
                 // Highlighted city state - keep fill but ensure border is active
                 el.attr('fill', this.getRegionColor(name, isDark, mode));
                 el.attr('stroke', theme.strokeActive);
                 el.attr('stroke-width', '2');
                 el.style('stroke-dasharray', null); // CSS class handles dash, ensure no inline override
            } else {
                el.attr('fill', this.getRegionColor(name, isDark, mode));
                
                if (mode === 'satellite') {
                    el.attr('stroke', '#1e293b').attr('stroke-width', '0.5');
                } else {
                    el.attr('stroke', theme.strokeDefault).attr('stroke-width', '1');
                }
                el.style('stroke-dasharray', null);
            }
        });

    // Update Text labels color
    this.g.selectAll('text.city-label')
        .attr('fill', mode === 'satellite' ? '#f1f5f9' : theme.text)
        .style('text-shadow', theme.textShadow);
  }

  updateMapVisuals(colors: Record<string, string>, isMulti: boolean, selected: string[], isDark: boolean) {
    if (!this.g) return;
    
    const theme = this.getThemeColors(isDark);
    const mode = this.viewMode();
    const effectivePinStroke = (isDark || mode === 'satellite') ? '#0f172a' : '#ffffff';

    // Update Pins
    this.g.selectAll('circle.city-pin')
      .attr('fill', (d: any) => colors[d.name] || '#ef4444')
      .attr('stroke', (d: any) => {
        if (isMulti && selected.includes(d.name)) return theme.text; 
        return effectivePinStroke;
      })
      .attr('stroke-width', (d: any) => {
        if (isMulti && selected.includes(d.name)) return 2.5;
        return 1.5;
      })
      .attr('r', (d: any) => {
        if (isMulti && selected.includes(d.name)) return 6; 
        return 4;
      });
    
    // Update Labels
    this.g.selectAll('text.city-label')
       .style('opacity', (d: any) => {
          if (isMulti && selected.length > 0 && !selected.includes(d.name)) return 0.5;
          return 1;
       })
       .attr('font-weight', (d: any) => {
          if (isMulti && selected.includes(d.name)) return '900';
          return '600';
       });
  }
}
