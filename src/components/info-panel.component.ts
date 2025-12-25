
import { Component, input, effect, inject, signal, output, viewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeminiService } from '../services/gemini.service';

export type ViewMode = 'state' | 'city' | null;

export interface SelectionData {
  type: 'state' | 'city';
  name: string;
}

export interface CityUpdate {
  name: string;
  color: string;
}

export interface MassUpdate {
  color?: string;
  note?: string;
}

interface StateData {
  summary: string;
  capital: string;
  facts: string[];
  famousDish: string;
  cultureEmoji: string;
}

const PRESET_COLORS = [
  '#ef4444', // Red
  '#3b82f6', // Blue
  '#22c55e', // Green
  '#f59e0b', // Amber
  '#a855f7', // Purple
];

@Component({
  selector: 'app-info-panel',
  imports: [CommonModule],
  template: `
    <div #scrollContainer class="h-full flex flex-col p-6 bg-white/90 dark:bg-slate-900/95 backdrop-blur-md border-l border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 overflow-y-auto transition-all duration-300 scroll-smooth">
      
      <!-- MASS SELECTION MODE -->
      @if (isMultiSelect()) {
        <div class="animate-fadeIn w-full h-full flex flex-col">
            <div class="flex items-center justify-between mb-6">
                <h2 class="text-2xl font-bold text-slate-900 dark:text-white">Mass Edit</h2>
                <div class="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-full text-xs font-bold uppercase tracking-wide">
                    {{ selectedCities().length }} Selected
                </div>
            </div>

            @if (selectedCities().length === 0) {
                <div class="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 space-y-4">
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12 opacity-50">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15.042 21.672 13.684 16.6m0 0-2.51 2.225.569-9.47 5.227 7.917-3.286-.672ZM12 2.25V4.5m5.834.166-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243-1.59-1.59" />
                     </svg>
                    <p class="text-center text-sm">Tap cities on the map to add them to your selection.</p>
                </div>
            } @else {
                <div class="space-y-6">
                    <!-- Selected List (Chips) -->
                    <div class="flex flex-wrap gap-2">
                        @for (city of selectedCities(); track city) {
                            <span class="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs text-slate-600 dark:text-slate-300">
                                {{ city }}
                            </span>
                        }
                    </div>

                    <!-- Mass Actions -->
                    <div class="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg space-y-4 shadow-sm">
                        <h3 class="font-bold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-700 pb-2">Apply to All</h3>
                        
                        <!-- Color -->
                        <div>
                             <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase">Pin Color</label>
                             <div class="flex flex-wrap gap-2">
                                @for (color of presets; track color) {
                                    <button
                                        (click)="applyMassColor(color)"
                                        [style.background-color]="color"
                                        class="w-8 h-8 rounded-full transition-transform hover:scale-110 focus:outline-none ring-1 ring-slate-200 dark:ring-slate-600 hover:ring-2 hover:ring-slate-400 dark:hover:ring-slate-400"
                                    ></button>
                                }
                             </div>
                        </div>
                        
                        <!-- Note -->
                         <div>
                             <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase">Update Note</label>
                             <textarea 
                                #massNoteInput
                                class="w-full h-24 p-3 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none resize-none"
                                placeholder="Write a note for all selected cities..."
                             ></textarea>
                             <button 
                                (click)="applyMassNote(massNoteInput.value); massNoteInput.value = ''"
                                class="mt-2 w-full py-2 bg-slate-800 dark:bg-slate-700 text-white text-sm rounded hover:bg-slate-700 dark:hover:bg-slate-600 transition-colors"
                             >
                                Append Note to All
                             </button>
                             <p class="text-[10px] text-slate-400 dark:text-slate-500 mt-1 text-center">This will append text to existing notes.</p>
                        </div>
                    </div>
                </div>
            }
        </div>
      } 
      
      <!-- SINGLE SELECTION MODE (Existing) -->
      @else if (!selection()) {
        <div class="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-600 space-y-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-16 h-16 opacity-50">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.159.69.159 1.006 0Z" />
          </svg>
          <p class="text-lg font-medium text-center">Select a state or city on the map.</p>
        </div>
      } @else {
        <div class="animate-fadeIn w-full">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-3xl font-bold text-slate-900 dark:text-white">
              {{ selection()?.name }}
            </h2>
            <span class="px-2 py-1 text-xs font-bold uppercase rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
              {{ selection()?.type }}
            </span>
          </div>

          <!-- CITY VIEW -->
          @if (selection()?.type === 'city') {
            <div class="space-y-6">
              <!-- Note Section -->
               <div class="p-4 bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30 rounded-lg">
                  <h3 class="text-orange-800 dark:text-orange-400 font-bold mb-2 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                    </svg>
                    Personal Notes
                  </h3>
                  <textarea 
                    [value]="cityNote()"
                    (input)="onNoteInput($event)"
                    class="w-full h-40 p-3 rounded-md border-slate-300 dark:border-slate-700 border focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none resize-none text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800"
                    placeholder="Write your notes about this city here..."
                  ></textarea>
                  <p class="text-xs text-slate-400 dark:text-slate-500 mt-2 text-right">
                    {{ saved() ? 'Changes saved' : 'Start typing to save...' }}
                  </p>
               </div>

               <!-- Color Selection -->
               <div class="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg space-y-4">
                  <div class="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5 text-slate-400">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42" />
                     </svg>
                     <span>Pin Color</span>
                  </div>
                  
                  <!-- Presets -->
                  <div class="flex gap-3 justify-between sm:justify-start">
                    @for (color of presets; track color) {
                        <button
                            (click)="updateColor(color)"
                            [style.background-color]="color"
                            class="w-8 h-8 rounded-full transition-transform hover:scale-110 focus:outline-none ring-2 ring-offset-2"
                            [class.ring-transparent]="cityColor() !== color"
                            [class.ring-slate-400]="cityColor() === color"
                            [attr.aria-label]="'Select color ' + color"
                        ></button>
                    }
                  </div>

                  <!-- Custom Picker -->
                  <div class="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700">
                    <span class="text-sm text-slate-500 dark:text-slate-400">Custom Shade</span>
                    <div class="relative overflow-hidden w-8 h-8 rounded-full shadow-sm ring-1 ring-slate-200 dark:ring-slate-600 cursor-pointer hover:scale-105 transition-transform">
                        <input 
                        type="color" 
                        [value]="cityColor()" 
                        (input)="onColorInput($event)"
                        class="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] cursor-pointer p-0 border-0"
                        >
                    </div>
                  </div>
               </div>
               
               <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-900/40">
                 <p class="text-sm text-blue-800 dark:text-blue-300">
                    <strong>Tip:</strong> Customize the pin color to categorize your destinations!
                 </p>
               </div>
            </div>
          }

          <!-- STATE VIEW -->
          @if (selection()?.type === 'state') {
            <div>
              @if (loading()) {
                <div class="flex flex-col items-center justify-center py-12 space-y-4">
                  <div class="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                  <p class="text-sm text-slate-500 dark:text-slate-400">Asking Gemini...</p>
                </div>
              } @else if (error()) {
                <div class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 rounded-lg text-red-700 dark:text-red-400 mt-4">
                  <p>Failed to load data. Please try again.</p>
                </div>
              } @else if (data()) {
                <div class="space-y-6 mt-4">
                  <!-- Header Stats -->
                  <div class="flex items-center space-x-4 text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                     <span class="text-4xl drop-shadow-sm">{{ data()?.cultureEmoji }}</span>
                     <div>
                       <p class="uppercase text-xs tracking-wider text-slate-400 dark:text-slate-500 font-bold">Capital</p>
                       <p class="font-bold text-slate-800 dark:text-slate-200">{{ data()?.capital }}</p>
                     </div>
                  </div>

                  <!-- Summary -->
                  <div>
                    <h3 class="text-lg font-bold text-orange-600 dark:text-orange-400 mb-2">Overview</h3>
                    <p class="leading-relaxed text-slate-600 dark:text-slate-300 text-sm">{{ data()?.summary }}</p>
                  </div>

                  <!-- Dish -->
                  <div class="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl border border-orange-100 dark:border-orange-900/30">
                    <h3 class="text-sm font-bold text-orange-800 dark:text-orange-300 mb-1 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4">
                        <path fill-rule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clip-rule="evenodd" />
                      </svg>
                      Must Try
                    </h3>
                    <p class="text-slate-900 dark:text-white font-medium">{{ data()?.famousDish }}</p>
                  </div>

                  <!-- Facts -->
                  <div>
                    <h3 class="text-lg font-bold text-blue-600 dark:text-blue-400 mb-3">Did You Know?</h3>
                    <ul class="space-y-3">
                      @for (fact of data()?.facts; track $index) {
                        <li class="flex items-start gap-3 bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                          <span class="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 text-xs font-bold">{{ $index + 1 }}</span>
                          <span class="text-sm text-slate-600 dark:text-slate-300">{{ fact }}</span>
                        </li>
                      }
                    </ul>
                  </div>

                </div>
              }
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fadeIn {
      animation: fadeIn 0.4s ease-out forwards;
    }
  `]
})
export class InfoPanelComponent {
  selection = input<SelectionData | null>(null);
  isMultiSelect = input(false);
  selectedCities = input<string[]>([]);
  
  colorChanged = output<CityUpdate>();
  massUpdate = output<MassUpdate>();

  scrollContainer = viewChild<ElementRef>('scrollContainer');
  
  private geminiService = inject(GeminiService);
  
  // State Data
  data = signal<StateData | null>(null);
  loading = signal(false);
  error = signal(false);

  // City Data
  cityNote = signal<string>('');
  cityColor = signal<string>('#ef4444');
  saved = signal(false);
  
  // Presets
  readonly presets = PRESET_COLORS;
  
  private saveTimeout: any;

  constructor() {
    effect(async () => {
      const sel = this.selection();
      const multi = this.isMultiSelect();
      
      // Reset Scroll
      if (this.scrollContainer()?.nativeElement) {
         this.scrollContainer()!.nativeElement.scrollTop = 0;
      }
      
      if (multi) return; // In multi mode, we use inputs directly in template

      if (!sel) {
        this.data.set(null);
        return;
      }

      if (sel.type === 'state') {
        this.loadStateData(sel.name);
      } else if (sel.type === 'city') {
        this.loadCityData(sel.name);
      }
    });
  }

  async loadStateData(stateName: string) {
    this.loading.set(true);
    this.error.set(false);
    this.data.set(null);

    try {
      const result = await this.geminiService.getStateDetails(stateName);
      this.data.set(result);
    } catch (err) {
      console.error(err);
      this.error.set(true);
    } finally {
      this.loading.set(false);
    }
  }

  loadCityData(cityName: string) {
    // Load Note
    const noteKey = `india_explorer_note_${cityName}`;
    const storedNote = localStorage.getItem(noteKey);
    this.cityNote.set(storedNote || '');
    this.saved.set(true);

    // Load Color
    const colorKey = `india_explorer_color_${cityName}`;
    const storedColor = localStorage.getItem(colorKey);
    this.cityColor.set(storedColor || '#ef4444');
  }

  onNoteInput(event: Event) {
    const val = (event.target as HTMLTextAreaElement).value;
    this.cityNote.set(val);
    this.saved.set(false);

    if (this.saveTimeout) clearTimeout(this.saveTimeout);
    this.saveTimeout = setTimeout(() => {
      const currentSelection = this.selection();
      if (currentSelection?.type === 'city') {
         localStorage.setItem(`india_explorer_note_${currentSelection.name}`, val);
         this.saved.set(true);
      }
    }, 500);
  }

  updateColor(val: string) {
    this.cityColor.set(val);
    const currentSelection = this.selection();
    if (currentSelection?.type === 'city') {
       localStorage.setItem(`india_explorer_color_${currentSelection.name}`, val);
       this.colorChanged.emit({ name: currentSelection.name, color: val });
    }
  }

  onColorInput(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.updateColor(val);
  }
  
  // Mass Actions
  applyMassColor(color: string) {
    this.massUpdate.emit({ color });
  }

  applyMassNote(note: string) {
    if (!note) return;
    this.massUpdate.emit({ note });
  }
}
