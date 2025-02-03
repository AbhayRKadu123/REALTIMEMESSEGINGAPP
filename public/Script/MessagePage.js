const socket = io();
let Room = document.getElementById('Room');
let sendButton = document.getElementById('sendButton');
let messageInput = document.getElementById('messageInput');
let UserId = document.getElementById('UserId');
let ChatContainer = document.getElementById('ChatContainer');
let UserName = document.getElementById('UserName');
let activeUsersList = document.getElementById('activeUsersList');
let Typing=document.getElementById('Typing')
console.log(Room.innerHTML);
console.log(Room.innerText);
let currentDate = new Date();

// Emit joinroom event with ActiveUser and room information
socket.emit('joinroom', { ActiveUser: UserName.innerHTML, room: Room.innerHTML.trim() });

// Play notification sound
function playSound() {
   const sound = new Audio('../Sprites/Notification.mp3'); // Adjust the path if needed
   sound.currentTime = 0;  // Reset audio to start
   sound.play().catch(error => console.error("Error playing sound:", error));
}

messageInput.addEventListener('keydown',()=>{
   console.log('abhay')
   socket.emit('isTyping',`${UserName.innerHTML} is Typing..`)
})

socket.on('istypingindicator',(msg)=>{
   console.log(msg)
   let {Newmsg,Newroom}=msg;
   if(Newroom==Room.innerText.trim()){
      Typing.innerHTML=Newmsg;
   }
  
   setTimeout(()=>{
      Typing.innerHTML='';

   }, 1000);

})



// Update active user list
socket.on('ActiveUserLst', (lst) => {
   // Clear the current active users list
   activeUsersList.innerHTML = '';

   for (let key in lst) {
      // Access the properties 'User' and 'Room' from each object in ActiveUsers
      if (Room.innerHTML.trim() === lst[key]['Room'].trim()) {
         let li = document.createElement('li');
         li.innerHTML = `${lst[key]['User']} <span class="text-success">●</span>`;
         li.setAttribute('class', 'ActiveUserLst list-group-item');
         activeUsersList.appendChild(li);
      }
   }
});

// Update deactivated user list
socket.on('DeActiveUserLst', (lst) => {
   activeUsersList.innerHTML = '';

   for (let key in lst) {
      // Access the properties 'User' and 'Room' from each object in ActiveUsers
      if (Room.innerHTML.trim() === lst[key]['Room'].trim()) {
         let li = document.createElement('li');
         li.innerHTML = `${lst[key]['User']} <span class="text-success">●</span>`;
         li.setAttribute('class', 'ActiveUserLst list-group-item');
         activeUsersList.appendChild(li);
      }
   }
});

// Send message on button click
document.addEventListener('click', (event) => {
   if (event.target.id === 'sendButton') {
      socket.emit('clientmsg', { UserName: UserName.innerHTML.trim(), Sender: UserId.innerHTML.trim(), Msg: messageInput.value });

      // Add the message to the chat container
      let div = document.createElement('div');
      div.setAttribute("class", "message-box received align-self-start");
      div.innerHTML = `<p><strong>You : </strong> ${messageInput.value}</p><span class="timestamp">${currentDate.toDateString()}</span>`;
      ChatContainer.appendChild(div);
      messageInput.value = '';
   }
});

// Receive and display messages
socket.on('msg', (msg) => {
   playSound();
   let div = document.createElement('div');
   div.setAttribute("class", "message-box sent align-self-end");
   div.innerHTML = `<p><strong>${msg.UserName}</strong> ${msg.Msg}</p><span class="timestamp">${currentDate.toDateString()}</span>`;
   ChatContainer.appendChild(div);
   console.log(msg);
});
