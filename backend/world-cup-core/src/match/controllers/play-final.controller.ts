import { Body, Controller, Post } from '@nestjs/common';
import { PlayFinalService } from '../services/play-final.service';

@Controller('final-match')
export class PlayFinalController {
  constructor(private readonly playFinalService: PlayFinalService) {}

  @Post('start')
  startFinal() {
    return this.playFinalService.startFinal();
  }

  @Post('play')
  playFinal(@Body('selectedOption') selectedOption: number) {
    return this.playFinalService.play(selectedOption);
  }

  @Post('strategy')
  changeStrategy(@Body('strategy') strategy: string) {
    return this.playFinalService.changeStrategy(strategy);
  }

  @Post('formation')
  changeFormation(@Body('formation') formation: string) {
    return this.playFinalService.changeFormation(formation);
  }
}