import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ChatUser } from 'src/app/models/chat-user';

@Component({
  selector: 'app-chatuser',
  templateUrl: './chatuser.component.html',
  styleUrls: ['./chatuser.component.css'],
})
export class ChatuserComponent implements OnInit {
  @Input() user?: ChatUser;
  @Input() checkBox: boolean = false;
  @Output() addUser: EventEmitter<ChatUser> = new EventEmitter();
  @Output() createRoom: EventEmitter<ChatUser> = new EventEmitter();

  constructor() {}

  ngOnInit(): void {}

  addUserHandler(e: Event) {
    const svg = e.target as HTMLElement;
    const input = svg.parentNode as HTMLElement;
    if (input.classList.contains('toggle')) {
      input.classList.remove('toggle');
    } else {
      input.classList.add('toggle');
    }
    this.addUser.emit(this.user);
  }
}
