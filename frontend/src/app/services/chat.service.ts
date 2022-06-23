import { Injectable } from '@angular/core';
import { filter, map, Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { ChatUser } from '../models/chat-user';
import { Message } from '../models/message';
import { Room } from '../models/room';
@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private socket: Socket;
  private url = 'http://localhost:3000';

  constructor() {
    this.socket = io(this.url);
  }

  setUserOnline(user: ChatUser) {
    this.socket.emit('user connected', user);
  }
  getUsersOnline(currentUserId: string): Observable<ChatUser[]> {
    return new Observable<ChatUser[]>((observer) => {
      this.socket.on('get users online', (data) => {
        observer.next(data);
      });
    }).pipe(map((data) => data.filter((user) => user.id !== currentUserId)));
  }

  setUserDisconnect(user: ChatUser) {
    this.socket.emit('user disconnected', user);
  }

  createRoom(data: {}) {
    this.socket.emit('create room', data);
  }

  setUserIsWriting(user: ChatUser | undefined, room: Room) {
    this.socket.emit('user is writing', { user: user, room: room });
  }

  getUserIsWriting(): Observable<ChatUser> {
    return new Observable<ChatUser>((observer) => {
      this.socket.on('user is writing', (data) => {
        observer.next(data);
      });
    });
  }

  getRooms(): Observable<Room> {
    return new Observable<Room>((observer) => {
      this.socket.on('room created', (data) => {
        observer.next(data);
      });
    });
  }

  sendMessage(data: Message) {
    this.socket.emit('send message', data);
  }

  getMessage(): Observable<Message> {
    return new Observable<Message>((observer) => {
      this.socket.on('send message', (data) => {
        observer.next(data);
      });
    });
  }
}
/*  */
