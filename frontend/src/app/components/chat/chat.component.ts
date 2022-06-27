import { Component, OnInit, SimpleChanges } from '@angular/core';
import { ChatUser } from 'src/app/models/chat-user';
import { Message } from 'src/app/models/message';
import { Room } from 'src/app/models/room';
import { ChatService } from 'src/app/services/chat.service';
import { v4 as uuidv4 } from 'uuid';

let users: ChatUser[] = [
  { id: uuidv4(), name: uuidv4().substring(0, 3), job: 'Software Engineering' },
];

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements OnInit {
  public isConnect: boolean = false;
  public createGroupButton: boolean = false;
  public addUserButton: boolean = false;
  public currentUser: ChatUser = { id: '', name: '', job: '' };
  public currentRoom!: Room | undefined;
  public rooms: Room[] = [];
  public userOnlineArray: ChatUser[] = [];
  public userOnlineFiltered: ChatUser[] = [];
  public userSelectedForGroup: ChatUser[] = [];
  public message: string = '';
  public messageArray: Message[] = [];
  public writingUser!: ChatUser | undefined;
  public displayUserButton: boolean = false;
  public filterInput: string = '';
  public groupNameInput: string = '';

  constructor(private chatService: ChatService) {}

  ngOnInit(): void {
    this.currentUser = users[0];
    this.setUserConnectHandler();
    this.chatService.getUsersOnline(this.currentUser.id).subscribe((data) => {
      this.updateSelectedDisabledUsersOnline(data);
    });
    this.chatService.getRooms().subscribe((data) => {
      this.rooms.push(data);
      if (data.createdBy.id === this.currentUser.id) {
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
      if (data.roomId === this.currentRoom?.roomId) {
        this.messageArray = this.rooms.filter(
          (room) => room.roomId === data.roomId
        )[0].messages;
      }
      this.scrollToBottom();
    });
    this.chatService.getUpdateRoom().subscribe((data) => {
      if (data) {
        let isInclude = this.rooms.some((room) => {
          if (room.roomId === data.roomId) {
            return true;
          }
          return false;
        });
        if (isInclude) {
          this.rooms = ([] as Room[]).concat(
            this.rooms.map((room) =>
              room.roomId === data.roomId ? (room = data) : room
            )
          );
          if (!data.isGroup && data.users.length < 2) {
            this.updateRoom('remove user', data, this.currentUser);
          }
          if (this.currentRoom?.roomId === data.roomId) {
            this.currentRoom = data;
          }
        } else {
          this.rooms.push(data);
        }
      }
    });
    this.chatService
      .getUserIsWriting()
      .subscribe((data) => (this.writingUser = data));
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log(changes);
  }

  /* Fonction pour conserver les modifications en cas de connexion déconnexion d'un utilisateur */
  updateSelectedDisabledUsersOnline(data: ChatUser[]) {
    this.userOnlineArray = data.map((user) =>
      this.userSelectedForGroup.some((elem) => {
        return user.id === elem.id;
      })
        ? {
            ...user,
            selected: true,
          }
        : user
    );

    this.updateSelectedDisabledUsersFiltered();

    if (this.addUserButton) {
      this.userOnlineArray = ([] as ChatUser[]).concat(
        this.userOnlineArray.map((user) =>
          this.currentRoom?.users.some((elem) => {
            return user.id === elem.id;
          })
            ? {
                ...user,
                disabled: true,
              }
            : user
        )
      );
      this.checkDisabledUser();
    }

    if (this.filterInput) {
      this.updateSelectedDisabledUsersWithFilter();
    }
  }

  updateSelectedDisabledUsersFiltered() {
    this.userOnlineFiltered = ([] as ChatUser[]).concat(
      this.userOnlineArray.map((user) =>
        this.userSelectedForGroup.some((elem) => {
          return user.id === elem.id;
        })
          ? {
              ...user,
              selected: true,
            }
          : user
      )
    );

    if (this.addUserButton && this.currentRoom) {
      this.userOnlineFiltered = ([] as ChatUser[]).concat(
        this.userOnlineArray.map((user) =>
          this.currentRoom?.users.some((elem) => {
            return user.id === elem.id;
          })
            ? {
                ...user,
                disabled: true,
              }
            : user
        )
      );
    }
    this.updateSelectedDisabledUsersWithFilter();
  }

  updateSelectedDisabledUsersWithFilter() {
    /* Filtration du tableau en fonction du filtre : this.filterInput */
    this.userOnlineFiltered = this.userOnlineArray.filter((user) =>
      user.name.toLowerCase().includes(this.filterInput.toLowerCase())
    );
    /* Pour que la liste des utilisateurs selectionnés soit mis à jour en cas de déconnexion d'un utilisateur */
    this.userSelectedForGroup = ([] as ChatUser[]).concat(
      this.userOnlineArray.filter((user) => user.selected === true)
    );
  }

  selectUserHandler(userSelected: ChatUser) {
    let selected: boolean = false;
    if (!userSelected.selected) {
      selected = true;
      this.userSelectedForGroup.push({ ...userSelected, selected: selected });
    }
    /* On modifie le user dans le tableau général {...user, selected: selected} */
    this.userOnlineArray = ([] as ChatUser[]).concat(
      this.userOnlineArray.map((user) =>
        user.id === userSelected.id ? { ...user, selected: selected } : user
      )
    );

    /* On modifie le user dans le tableau filtré {...user, selected: selected} */
    this.userOnlineFiltered = ([] as ChatUser[]).concat(
      this.userOnlineFiltered.map((user) =>
        user.id === userSelected.id ? { ...user, selected: selected } : user
      )
    );

    /* Si'lutilisateur était déjà dans this.userSelectedForGroup on le retire */
    if (userSelected.selected) {
      this.userSelectedForGroup = this.userSelectedForGroup.filter(
        (user) => user.id !== userSelected.id
      );
    }
  }

  scrollToBottom() {
    let container = document.querySelector(
      '.messages-container'
    ) as HTMLElement;
    if (container) {
      setTimeout(
        () =>
          container.scroll({
            top: container.scrollHeight,
            left: 0,
            behavior: 'smooth',
          }),
        25
      );
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

  checkDisabledUser() {
    this.userOnlineArray = ([] as ChatUser[]).concat(
      this.userOnlineArray.map((user) =>
        this.currentRoom?.users.some((elem) => {
          return user.id === elem.id;
        })
          ? { ...user, selected: true, disabled: true }
          : user
      )
    );

    this.userOnlineFiltered = ([] as ChatUser[]).concat(
      this.userOnlineFiltered.map((user) =>
        this.currentRoom?.users.some((elem) => {
          return user.id === elem.id;
        })
          ? { ...user, selected: true, disabled: true }
          : user
      )
    );
  }

  setCurrentRoom(room: Room) {
    this.scrollToBottom();
    this.currentRoom = this.rooms.filter((x) => x.roomId === room.roomId)[0];
    this.messageArray = this.currentRoom.messages;
  }

  createRoom(
    selectedUsers: ChatUser[],
    isGroup: boolean = false,
    groupName?: string
  ) {
    selectedUsers.push(this.currentUser);
    this.chatService.createRoom({
      users: selectedUsers,
      isGroup: isGroup,
      groupName: groupName,
    });
    if (isGroup) {
      this.displayGroupInputHandler(true, false, undefined);
    }
  }

  updateRoom(
    type: string,
    room?: Room,
    user?: ChatUser,
    users?: ChatUser[],
    groupName?: string
  ) {
    if (type === 'remove user') {
      this.rooms = ([] as Room[]).concat(
        this.rooms.filter((x) => x.roomId !== room?.roomId)
      );
      this.currentRoom = undefined;
    }
    if (type === 'add users') {
      this.displayGroupInputHandler(false, true, undefined);
    }
    this.chatService.updateRoom({ type, room, user, users, groupName });
  }

  setUserIsWritingHandler() {
    if (this.message) {
      this.chatService.setUserIsWriting(this.currentUser, this.currentRoom);
    } else {
      this.chatService.setUserIsWriting(undefined, this.currentRoom);
    }
  }

  sendMessage() {
    let data = {
      id: this.currentUser.id,
      name: this.currentUser.name,
      message: this.message,
      roomId: this.currentRoom?.roomId,
    };
    this.chatService.sendMessage(data);
    this.chatService.setUserIsWriting(undefined, this.currentRoom);
    this.message = '';
  }

  setUserDisconnect(user: ChatUser) {
    this.chatService.setUserDisconnect(user);
  }

  displayUserButtonHandler() {
    if (!this.displayUserButton && this.createGroupButton) {
      this.createGroupButton = false;
    }
    this.displayUserButton = !this.displayUserButton;
  }

  displayGroupInputHandler(create: boolean, update: boolean, e?: Event) {
    if (e) {
      if (!this.clickOnOverlay(e)) {
        return;
      } /*  */
    }
    if (!this.displayUserButton) {
      this.displayUserButtonHandler();
    }
    if (create) {
      this.createGroupButton = !this.createGroupButton;
    }
    if (update) {
      this.addUserButton = !this.addUserButton;
    }

    /* A la fermeture de la modal, on réinitialise tous les changements */
    this.groupNameInput = '';
    this.userSelectedForGroup = [];
    this.userOnlineFiltered = ([] as ChatUser[]).concat(
      this.userOnlineFiltered.map((user) =>
        user.selected
          ? { ...user, selected: false }
          : user.disabled
          ? { ...user, disabled: false }
          : user
      )
    );

    if (this.addUserButton) {
      this.checkDisabledUser();
    }
  }

  clickOnOverlay(e: Event) {
    let overlay = e?.target as HTMLElement;
    return overlay.className === 'modal-overlay';
  }
}
