import { Component, OnInit } from '@angular/core';
import { GroupsService } from './service/groups.service'; 

@Component({
  selector: 'app-groups-page',
  standalone: false,
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.css']
})
export class GroupsPageComponent implements OnInit {
  misGrupos: any[] = [];

  
  constructor(private groupsService: GroupsService) {}

  ngOnInit(): void {
    this.groupsService.getFaseDeGrupos().subscribe({
      next: (data) => {
        this.misGrupos = data.groups; 
      },
      error: (err) => {
        console.error('Error en el Front al conectar con el Back:', err);
      }
    });
  }
}