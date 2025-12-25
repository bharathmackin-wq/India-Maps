
import { Component, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapComponent } from './components/map.component';
import { InfoPanelComponent, SelectionData, CityUpdate, MassUpdate } from './components/info-panel.component';

export interface City {
  name: string;
  coords: [number, number];
}

@Component({
  selector: 'app-root',
  imports: [CommonModule, MapComponent, InfoPanelComponent],
  template: `
    <div class="flex flex-col md:flex-row h-screen w-screen bg-slate-50 dark:bg-slate-950 overflow-hidden font-sans transition-colors duration-300">
      
      <!-- Top Bar (Mobile Only) -->
      <div class="md:hidden bg-white dark:bg-slate-900 p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center z-20 shadow-sm transition-colors duration-300">
        <h1 class="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
          India Explorer
        </h1>
        <div class="flex items-center gap-2">
            <button (click)="toggleTheme()" class="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors">
                 @if (isDark()) {
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                    </svg>
                 } @else {
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
                    </svg>
                 }
            </button>
            <button (click)="toggleSidebar()" class="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200">
            @if (showSidebar()) {
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
            } @else {
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                </svg>
            }
            </button>
        </div>
      </div>

      <!-- Main Content Area -->
      <div class="relative flex-1 h-full">
        <!-- Theme Toggle (Desktop) -->
        <div class="hidden md:block absolute top-4 left-4 z-20">
             <button (click)="toggleTheme()" class="p-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur shadow-lg rounded-full border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200">
                 @if (isDark()) {
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                    </svg>
                 } @else {
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
                    </svg>
                 }
            </button>
        </div>

        <!-- Map -->
        <app-map 
          (stateSelected)="onStateSelected($event)"
          (citySelected)="onCitySelected($event)"
          (cityToggled)="onCityToggled($event)"
          (toggleMultiSelect)="onToggleMultiSelect()"
          [cityColors]="cityColors()"
          [isMultiSelect]="isMultiSelect()"
          [selectedCities]="selectedCities()"
          [isDark]="isDark()"
        ></app-map>
      </div>

      <!-- Sidebar -->
      <div 
        class="fixed inset-y-0 right-0 z-30 w-full md:w-96 md:relative md:inset-auto transform transition-transform duration-300 ease-in-out bg-white dark:bg-slate-900 shadow-2xl md:shadow-none border-l border-slate-200 dark:border-slate-800"
        [class.translate-x-full]="!showSidebar() && isMobile()"
        [class.translate-x-0]="showSidebar() || !isMobile()"
      >
        <app-info-panel 
          [selection]="currentSelection()" 
          [isMultiSelect]="isMultiSelect()"
          [selectedCities]="selectedCities()"
          (colorChanged)="onColorChanged($event)"
          (massUpdate)="onMassUpdate($event)"
        ></app-info-panel>
        
        <!-- Mobile Close Button (Floating inside sidebar) -->
        @if (isMobile()) {
          <button 
            (click)="toggleSidebar()"
            class="absolute top-4 right-4 p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
          >
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        }
      </div>

    </div>
  `
})
export class AppComponent {
  currentSelection = signal<SelectionData | null>(null);
  cityColors = signal<Record<string, string>>({});
  
  // Multi-Select State
  isMultiSelect = signal(false);
  selectedCities = signal<string[]>([]);
  
  showSidebar = signal(false); 
  isMobile = signal(false);

  // Theme State
  isDark = signal(false);

  constructor() {
    this.checkMobile();
    this.loadColors();
    this.loadTheme();
    window.addEventListener('resize', () => this.checkMobile());
  }

  loadTheme() {
    if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem('india_explorer_theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (stored === 'dark' || (!stored && prefersDark)) {
            this.setTheme(true);
        } else {
            this.setTheme(false);
        }
    }
  }

  toggleTheme() {
    this.setTheme(!this.isDark());
  }

  setTheme(isDark: boolean) {
    this.isDark.set(isDark);
    if (isDark) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('india_explorer_theme', 'dark');
    } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('india_explorer_theme', 'light');
    }
  }

  checkMobile() {
    this.isMobile.set(window.innerWidth < 768);
  }

  loadColors() {
    const colors: Record<string, string> = {};
    if (typeof localStorage !== 'undefined') {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('india_explorer_color_')) {
          const cityName = key.replace('india_explorer_color_', '');
          const color = localStorage.getItem(key);
          if (color) {
            colors[cityName] = color;
          }
        }
      }
    }
    this.cityColors.set(colors);
  }
  
  toggleSidebar() {
    this.showSidebar.update(v => !v);
  }

  onStateSelected(stateName: string) {
    if (this.isMultiSelect()) return; // Ignored in multi mode
    this.currentSelection.set({ type: 'state', name: stateName });
    if (this.isMobile()) {
      this.showSidebar.set(true);
    }
  }

  onCitySelected(cityName: string) {
    if (this.isMultiSelect()) return;
    this.currentSelection.set({ type: 'city', name: cityName });
    if (this.isMobile()) {
      this.showSidebar.set(true);
    }
  }

  onToggleMultiSelect() {
    this.isMultiSelect.update(v => !v);
    if (this.isMultiSelect()) {
      // Enter mode: Clear current single selection to show Mass View or Empty State
      this.currentSelection.set(null);
      if (this.isMobile()) {
        this.showSidebar.set(true); // Open sidebar so they see the instructions
      }
    } else {
      // Exit mode: Clear multi selection list
      this.selectedCities.set([]);
    }
  }

  onCityToggled(cityName: string) {
    this.selectedCities.update(cities => {
      if (cities.includes(cityName)) {
        return cities.filter(c => c !== cityName);
      } else {
        return [...cities, cityName];
      }
    });
    
    // Ensure sidebar is open to show selection
    if (this.isMobile() && this.selectedCities().length > 0) {
      this.showSidebar.set(true);
    }
  }

  onColorChanged(event: CityUpdate) {
    this.cityColors.update(colors => ({
      ...colors,
      [event.name]: event.color
    }));
  }

  onMassUpdate(event: MassUpdate) {
    const cities = this.selectedCities();
    if (cities.length === 0) return;

    // Mass Color Update
    if (event.color) {
      const newColors = { ...this.cityColors() };
      cities.forEach(city => {
        newColors[city] = event.color!;
        localStorage.setItem(`india_explorer_color_${city}`, event.color!);
      });
      this.cityColors.set(newColors);
    }

    // Mass Note Update
    if (event.note) {
      cities.forEach(city => {
        const key = `india_explorer_note_${city}`;
        const existing = localStorage.getItem(key) || '';
        // Append with a newline if exists
        const newVal = existing ? `${existing}\n${event.note}` : event.note;
        localStorage.setItem(key, newVal!);
      });
    }
  }
}
