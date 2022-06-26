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
  @Input() currentUser?: ChatUser;
  @Output() setCurrentRoom: EventEmitter<Room> = new EventEmitter();
  public roomTitle: string | undefined = '';

  constructor() {}

  ngOnInit(): void {
    this.roomTitle = this.setRoomTitle();
  }

  setRoomTitle(): string | undefined {
    if (this.room?.isGroup) {
      return this.room.groupName;
    } else {
      return this.room?.users[0]?.id === this.currentUser?.id
        ? this.room?.users[1]?.name
        : this.room?.users[0]?.name;
    }
  }
}
