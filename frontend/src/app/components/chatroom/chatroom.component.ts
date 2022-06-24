import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ChatUser } from 'src/app/models/chat-user';
import { Room } from 'src/app/models/room';

@Component({
  selector: 'app-chatroom',
  templateUrl: './chatroom.component.html',
  styleUrls: ['./chatroom.component.css'],
})
export class ChatroomComponent implements OnInit {
  @Input() room?: Room;
  @Input() active: boolean = false;
  @Input() currentUser!: ChatUser;
  @Output() setCurrentRoom: EventEmitter<Room> = new EventEmitter();

  constructor() {}

  ngOnInit(): void {
    console.log(this.room);
  }
}
