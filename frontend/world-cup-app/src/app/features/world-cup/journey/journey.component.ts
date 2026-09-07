import { Component, OnInit, inject } from "@angular/core";
import { JourneyViewModel } from "./model/journey-view-model.interface";
import { JourneyService } from "./service/journey.service";

@Component({
  selector: "app-journey-page",
  standalone: false,
  templateUrl: "./journey.component.html",
  styleUrls: ["./journey.component.css"],
})
export class JourneyPageComponent implements OnInit {
  private readonly journeyService = inject(JourneyService);

  public pageState: JourneyViewModel = this.journeyService.getViewModel();

  ngOnInit(): void {
    this.journeyService.initialize();
  }
}
