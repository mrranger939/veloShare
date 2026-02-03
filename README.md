

# Project Plan: veloShare Application (React + Express)

## Final Goal

Devices connected to the same Wi-Fi network should be able to:

* Discover each other
* Choose Send or Receive mode
* Select a target device
* Send a file
* Require receiver confirmation
* Transfer the file successfully

---

## Phase 0 – Foundation

### Step 0.1 – Project Setup

Tasks:

* Create:

  * `backend/` → Express application
  * `frontend/` → React application
* Run both servers
* Open frontend in browser
* Confirm backend is reachable using LAN IP (not localhost)

Learning objectives:

* Project structure
* LAN access basics

---

## Phase 1 – Device Discovery (No file transfer)

### Step 1.1 – Socket Connection

Each device:

* Connects to backend using Socket.IO
* Sends its device name (e.g., “Shujath-PC”)

### Step 1.2 – Online Device List

Backend stores:

* Socket ID
* Device name

Frontend displays:

* List of connected devices

Expected output:

Available devices:

* Laptop
* Phone
* Friend-PC

Learning objectives:

* WebSockets
* Real-time UI updates
* Client list management

---

## Phase 2 – Send Request (No file transfer)

### Step 2.1 – Send Intent

Sender:

* Selects a device
* Clicks “Send”

Backend emits:

```
incoming_request
```

### Step 2.2 – Confirmation Dialog

Receiver sees:

```
Shujath wants to send a file. Accept?
```

Receiver can:

* Accept
* Reject

### Step 2.3 – Response Handling

Receiver sends:

```
accepted / rejected
```

Sender UI updates accordingly.

Learning objectives:

* Event flow design
* Request-response using sockets
* UI state synchronization

---

## Phase 3 – File Selection (Metadata only)

### Step 3.1 – File Picker

Sender selects a file and displays:

* Filename
* File size

### Step 3.2 – Metadata Transmission

Send only:

* Name
* Size
* Type

Receiver sees:

```
Incoming: photo.png (2.4 MB)
Accept?
```

Learning objectives:

* File APIs
* Metadata handling
* User experience flow

---

## Phase 4 – File Transfer

### Step 4.1 – HTTP Upload

Sender uploads file to receiver endpoint:

```
POST /upload
```

### Step 4.2 – File Storage

Receiver saves file to:

```
/downloads
```

### Step 4.3 – Completion Messages

Receiver:

```
File received
```

Sender:

```
Transfer complete
```

Learning objectives:

* Multipart uploads
* File streams
* Disk writing
* Memory safety

---

## Phase 5 – Progress and UX

### Step 5.1 – Progress Bar

Display transfer percentage during upload.

### Step 5.2 – Error Handling

Handle cases:

* Device disconnects
* Request rejected
* Transfer failure

Learning objectives:

* Asynchronous UX
* Failure states
* Recovery logic

---

## Phase 6 – Basic Safety

### Step 6.1 – Validation

* Maximum file size
* Allowed file types

### Step 6.2 – Transfer Token

* Use random token to prevent incorrect device uploads

Learning objectives:

* Security mindset
* Trust boundaries

---

## Phase 7 – Polish

Optional enhancements:

* Device rename
* Dark mode
* Drag and drop
* Transfer history

---

## Exclusions (Initial Version)

The following will not be implemented initially:

* WebRTC
* Encryption
* Cloud services
* Accounts
* Databases

Scope includes only:

* LAN
* Files
* Devices
* Confirmations

---

## Development Rules

* Implement one phase at a time
* Build first, then expand
* Debug before proceeding
* No skipping phases

---

## Next Step: Phase 0

If you say:

“Start Phase 0”

The next response will include:

* Exact folder structure
* Commands
* Minimal Express server
* Minimal React app
* Instructions to run both


