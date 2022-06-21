import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
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

  setUserDisconnect(user: ChatUser) {
    this.socket.emit('user disconnected', user);
  }

  createRoom(data: {}) {
    this.socket.emit('create room', data);
  }

  setRoom(): Observable<Room> {
    return new Observable<Room>((observer) => {
      this.socket.on('room created', (data) => {
        observer.next(data);
      });
    });
  }

  getUsersOnline(): Observable<ChatUser[]> {
    return new Observable<ChatUser[]>((observer) => {
      this.socket.on('get users online', (data) => {
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
