import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ChatUser } from 'src/app/models/chat-user';

@Component({
  selector: 'app-chatuser',
  templateUrl: './chatuser.component.html',
  styleUrls: ['./chatuser.component.css'],
})
export class ChatuserComponent implements OnInit {
  @Input() user?: ChatUser;
  @Input() hoverEffect: boolean = true;
  @Input() checkBox: boolean = false;
  @Output() addUser: EventEmitter<ChatUser> = new EventEmitter();
  @Output() createRoom: EventEmitter<ChatUser> = new EventEmitter();

  constructor() {}

  ngOnInit(): void {}
}
