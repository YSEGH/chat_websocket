import { Component, OnInit, SimpleChanges } from '@angular/core';
import { Observable } from 'rxjs';
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
  public isConnect: boolean = false;
  public createGroup: boolean = false;
  public currentRoom!: Room;
  public rooms: Room[] = [];
  public userOnlineArray$!: ChatUser[];
  public selectedUsers: ChatUser[] = [];
  public currentUser: ChatUser = { id: '', name: '' };
  public message: string = '';
  public messageArray: Message[] = [];
  public writingUser!: ChatUser | undefined;
  public displayListUser: boolean = false;
  public filteredList: ChatUser[] = [];
  public listFilter: string = '';

  constructor(private chatService: ChatService) {}

  ngOnInit(): void {
    this.currentUser = users[0];

    this.chatService.getUsersOnline(this.currentUser.id).subscribe((data) => {
      this.userOnlineArray$ = data;
      this.setFilteredListHandler(data);
    });
    this.chatService.getRooms().subscribe((data) => {
      this.rooms.push(data);
      if (data.users.currentUser.id === this.currentUser.id) {
        this.setCurrentRoom(data);
        this.scrollToBottom();
      }
    });
    this.chatService.getMessage().subscribe((data) => {
      this.rooms = this.rooms.map((room) =>
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
      if (data.roomId === this.currentRoom.roomId) {
        this.messageArray = this.rooms.filter(
          (room) => room.roomId === data.roomId
        )[0].messages;
      }
      this.scrollToBottom();
    });
    this.chatService
      .getUserIsWriting()
      .subscribe((data) => (this.writingUser = data));
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

  setUserConnectHandler() {
    this.chatService.setUserOnline(this.currentUser);
    this.isConnect = true;
  }

  setUserDisconnectHandler() {
    this.isConnect = false;
    this.chatService.setUserDisconnect(this.currentUser);
  }

  addUserHandler(user: ChatUser) {
    this.selectedUsers.push(user);
    console.log(this.selectedUsers);
  }

  setUserIsWritingHandler() {
    if (this.message) {
      this.chatService.setUserIsWriting(this.currentUser, this.currentRoom);
    } else {
      this.chatService.setUserIsWriting(undefined, this.currentRoom);
    }
  }

  setFilteredListHandler(userList: ChatUser[]) {
    this.filteredList = userList.filter((user) =>
      user.name.toLowerCase().includes(this.listFilter.toLowerCase())
    );
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
    this.chatService.setUserIsWriting(undefined, this.currentRoom);
    this.message = '';
  }

  setUserDisconnect(user: ChatUser) {
    this.chatService.setUserDisconnect(user);
  }

  displayListUserHandler(close: boolean = false) {
    if (!this.displayListUser && this.createGroup) {
      this.createGroup = false;
    }
    this.displayListUser = !this.displayListUser;
  }

  displayGroupInputHandler() {
    if (!this.displayListUser) {
      this.displayListUserHandler();
    }
    this.createGroup = !this.createGroup;
  }
}
