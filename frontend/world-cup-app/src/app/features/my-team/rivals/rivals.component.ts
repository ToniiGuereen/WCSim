// frontend/world-cup-app/src/app/features/my-team/rivals/rivals.component.ts
import { Component, OnInit } from '@angular/core';
import { RivalsService } from './service/rivals.service';
import { RivalsViewModel } from './model/rivals-view-model.interface';

@Component({
  selector: 'app-rivals-page',
  standalone: false,
  templateUrl: './rivals.component.html',
  styleUrls: ['./rivals.component.css'],
})
export class RivalsPageComponent implements OnInit {
  constructor(private readonly rivalsService: RivalsService) {}

  get vm(): RivalsViewModel {
    return this.rivalsService.getViewModel();
  }

  ngOnInit(): void {
    this.rivalsService.initialize();
  }
}
