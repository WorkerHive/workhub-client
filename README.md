## WorkerHive Client 

A flexible client for workhub instances, crud type models are fetched on startup and transformed into the respective CRUD operations on the client 

### Usage

```
    yarn add @workerhive/client
```

```
import { WorkhubClient } from "@workerhive/client";

let client = new WorkhubClient(url)

client.addTypeName({})

```