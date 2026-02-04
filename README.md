
# Project Plan: veloShare 

## 1. Final Goal

Users should be able to:

* Open the veloShare website
* Choose **Send** or **Receive**
* Create or join a room (via code or link)
* Sender selects a file
* Receiver confirms the transfer
* File transfers occur **peer-to-peer**
* The server never stores the file

The system must work across:

* Same Wi-Fi network
* Different Wi-Fi networks
* Different countries

---

## 2. Architecture

```
React (Frontend)
      ↓ WebSocket
Express + Socket.IO (Signaling Server)
      ↓ WebRTC
Peer A  ←────────→  Peer B
      (file stream)
```

**Server responsibilities:**

* Room creation
* Exchanging WebRTC signaling data (offers, answers, ICE candidates)

**Client responsibilities:**

* Establish peer-to-peer connection
* Transfer file data directly between browsers

No file data is stored or processed by the server.

---

## 3. Phase 0 – Foundation

### Step 0.1 – Project Setup

**Tasks:**

* Create:

  * `backend/` → Express + Socket.IO
  * `frontend/` → React
* Run both servers
* Open frontend in a browser
* Confirm backend is reachable from the browser

**Learning Objectives:**

* Project structure
* Client–server communication
* Local development environment setup

---

## 4. Phase 1 – Room and Peer Connection (No File Transfer)

### Step 1.1 – Socket Connection

Each client:

* Connects to backend using Socket.IO
* Chooses:

  * Create room
  * Join room using a code

Backend:

* Generates room IDs
* Tracks socket IDs per room

---

### Step 1.2 – WebRTC Handshake

Server handles signaling only:

* `offer`
* `answer`
* `ice-candidate`

Clients establish:

```
Peer A  ←→  Peer B
(WebRTC data channel)
```

**Expected Output:**

```
Room connected  
Peer joined  
```

**Learning Objectives:**

* WebSocket signaling
* WebRTC fundamentals
* Peer connection lifecycle

---

## 5. Phase 2 – Send Request (No File Data)

### Step 2.1 – Send Intent

Sender action:

```
Send file
```

Backend emits to peer:

```
incoming_request
```

---

### Step 2.2 – Confirmation Dialog

Receiver sees:

```
Shujath wants to send a file. Accept?
```

Options:

* Accept
* Reject

---

### Step 2.3 – Response Handling

Receiver sends:

* `accepted` or `rejected`

Sender UI updates accordingly.

**Learning Objectives:**

* Event flow design
* Request–response signaling
* UI state synchronization

---

## 6. Phase 3 – File Selection (Metadata Only)

### Step 3.1 – File Picker

Sender selects a file and displays:

* Filename
* File size
* File type

---

### Step 3.2 – Metadata Transmission

Metadata sent via signaling:

* Name
* Size
* Type

Receiver sees:

```
Incoming: photo.png (2.4 MB)
Accept?
```

**Learning Objectives:**

* File API usage
* Metadata handling
* User experience flow

---

## 7. Phase 4 – File Transfer (WebRTC)

### Step 4.1 – Data Channel Transfer

Sender:

* Splits file into chunks
* Sends chunks via WebRTC data channel

Receiver:

* Reassembles file from chunks

---

### Step 4.2 – Save File

Receiver:

* Creates a Blob
* Triggers browser download

---

### Step 4.3 – Completion Messages

Receiver:

```
File received
```

Sender:

```
Transfer complete
```

**Learning Objectives:**

* Streaming binary data
* Chunking strategies
* Memory management
* Peer-to-peer transfer mechanics

---

## 8. Phase 5 – Progress and User Experience

### Step 5.1 – Progress Bar

Display:

* Percentage completed
* Transfer speed (optional)

---

### Step 5.2 – Error Handling

Handle:

* Peer disconnection
* Rejected requests
* Interrupted transfers

**Learning Objectives:**

* Asynchronous UI updates
* Failure state management
* Recovery logic

---

## 9. Phase 6 – Basic Safety

### Step 6.1 – Validation

* Maximum file size limits
* Allowed file types

---

### Step 6.2 – Room Security

* Randomized room codes
* Single-use sessions

**Learning Objectives:**

* Security awareness
* Trust boundary design

---

## 10. Phase 7 – Optional Enhancements

* Drag and drop support
* Dark mode
* QR code for room links
* Transfer history

---

## 11. Exclusions (Initial Version)

Not implemented:

* LAN scanning
* Encryption
* User accounts
* Database
* Cloud storage

Scope includes only:

* Browser-based application
* Peer-to-peer file transfer
* Room-based connections
* User confirmation flow

---

## 12. Development Rules

* Implement one phase at a time
* Do not skip phases
* Each phase must function correctly before proceeding
* Debug issues before adding new features

