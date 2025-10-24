```mermaid
erDiagram
    USER ||--o{ BLOG : authors

    USER {
      ObjectId id
      string first_name
      string last_name
      string email
      string password
    }

    BLOG {
      ObjectId id
      string title
      string description
      ObjectId author
      string state
      int read_count
      int reading_time
      string tags
      string body
      datetime createdAt
      datetime updatedAt
    }
```
