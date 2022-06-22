import { Component, OnInit, SimpleChanges } from '@angular/core';
import { ChatUser } from 'src/app/models/chat-user';
import { Message } from 'src/app/models/message';
import { Room } from 'src/app/models/room';
import { ChatService } from 'src/app/services/chat.service';
import { v4 as uuidv4 } from 'uuid';

let users: { id: string; name: string }[] = [
  { id: uuidv4(), name: uuidv4().substring(0, 3) },
];

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements OnInit {
  public currentRoom!: Room;
  public rooms: Room[] = [];
  public userOnlineArray: ChatUser[] = [];
  public currentUser: ChatUser = { id: '', name: '' };
  public message: string = '';
  public messageArray: Message[] = [];
  public writingUser?: ChatUser;

  constructor(private chatService: ChatService) {}

  ngOnInit(): void {
    this.setCurrentUser();
    /* this.messageArray = [
      {
        id: this.currentUser.id,
        name: this.currentUser.name,
        message: 'Hey, comment vas tu ?',
        roomId: 'hjfdshfuerjk',
      },
      {
        id: this.currentUser.id,
        name: this.currentUser.name,
        message: 'Hey, comment vas tu ?',
        roomId: 'hjfdshfuerjk',
      },
      {
        id: this.currentUser.id,
        name: this.currentUser.name,
        message: 'Hey, comment vas tu ?',
        roomId: 'hjfdshfuerjk',
      },
      {
        id: 'this.currentUser.id',
        name: this.currentUser.name,
        message: 'Hey, comment vas tu ?',
        roomId: 'hjfdshfuerjk',
      },
      {
        id: this.currentUser.id,
        name: this.currentUser.name,
        message: 'Hey, comment vas tu ?',
        roomId: 'hjfdshfuerjk',
      },
      {
        id: 'this.currentUser.id',
        name: this.currentUser.name,
        message: 'Hey, comment vas tu ?',
        roomId: 'hjfdshfuerjk',
      },
      {
        id: 'this.currentUser.id',
        name: this.currentUser.name,
        message: 'Hey, comment vas tu ?',
        roomId: 'hjfdshfuerjk',
      },
      {
        id: this.currentUser.id,
        name: this.currentUser.name,
        message: 'Hey, comment vas tu ?',
        roomId: 'hjfdshfuerjk',
      },
      {
        id: this.currentUser.id,
        name: this.currentUser.name,
        message: 'Hey, comment vas tu ?',
        roomId: 'hjfdshfuerjk',
      },
      {
        id: this.currentUser.id,
        name: this.currentUser.name,
        message: 'Hey, comment vas tu ?',
        roomId: 'hjfdshfuerjk',
      },
    ]; */
    this.chatService.setUserOnline(this.currentUser);
    this.chatService.getUsersOnline().subscribe({
      next: (data) => {
        this.userOnlineArray = data.filter(
          (user) => user.id !== this.currentUser.id
        );
      },
      complete: () => {},
    });
    this.chatService.setRoom().subscribe((data) => {
      this.rooms.push(data);
      if (data.users.currentUser.id === this.currentUser.id) {
        this.setCurrentRoom(data);
        this.scrollToBottom();
      }
    });
    this.chatService.getMessage().subscribe((data) => {
      let updateRooms = this.rooms.map((room) =>
        room.roomId === data.roomId
          ? {
              ...room,
              messages: [
                ...room.messages,
                {
                  id: data.id,
                  name: data.name,
                  message: data.message,
                  roomId: data.roomId,
                },
              ],
            }
          : room
      );
      this.rooms = updateRooms;
      if (data.roomId === this.currentRoom.roomId) {
        this.messageArray = this.rooms.filter(
          (room) => room.roomId === data.roomId
        )[0].messages;
      }
      this.scrollToBottom();
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log(changes);
  }

  scrollToBottom() {
    let container = document.querySelector(
      '.messages-container'
    ) as HTMLElement;
    if (container) {
      setTimeout(() => container.scrollTo(0, container.scrollHeight), 50);
    }
  }

  setCurrentUser() {
    this.currentUser =
      users[Math.floor(Math.random() * (users.length - 1 - 0 + 1) + 0)];
  }

  setUserIsWriting() {
    if (this.message) {
      console.log(`${this.currentUser.name} est en train d'écrire`);
    } else {
      console.log(`${this.currentUser.name} n'est plus en train d'écrire`);
    }
  }

  setCurrentRoom(room: Room) {
    this.scrollToBottom();
    this.currentRoom = this.rooms.filter((x) => x.roomId === room.roomId)[0];
    this.messageArray = this.currentRoom.messages;
  }

  createRoom(selectedUser: ChatUser) {
    this.chatService.createRoom({
      currentUser: this.currentUser,
      selectedUser: selectedUser,
    });
  }
  sendMessage() {
    let data = {
      id: this.currentUser.id,
      name: this.currentUser.name,
      message: this.message,
      roomId: this.currentRoom.roomId,
    };
    this.chatService.sendMessage(data);
    this.message = '';
    this.writingUser = undefined;
  }

  setUserDisconnect(user: ChatUser) {
    this.chatService.setUserDisconnect(user);
  }
}
