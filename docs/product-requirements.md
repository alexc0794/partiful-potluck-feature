# Partiful Potluck Feature

## Product Requirements

- Allow hosts + cohosts to configure a potluck party where guests reserve the right to bring particular items to the party.
- A party is optionally a potluck
- A party potluck can be enabled or disabled
- The items of a potluck can be determined by the hosts, and potentially also by the guests.
- What is a potluck item?
  - Potluck items can range anywhere from snacks to drinks to cooked meals to utensils to balloons to flowers.
  - Required fields include a name, quantity, image / icon, maybe a URL link where you can go purchase it
  - Whether it is required or optional
  - An optional price limit
    - Or even set a $-$$$$ range. This way guests can have a rough estimation of how expensive an item is expected to be, as well as guests can get a sense of how much other guests are spending on average.
  - Potluck items can often be vague. If we want to bring chips, do we want Doritos or Lays or does it matter?
    - Perhaps the potluck item is initially vague, and when it is claimed the claimer can explicitly describe the item (i.e. host requests for a “main course” and guest claims it and updates the description to “turkey”).
- What do you do with a potluck item?
  - Guests can claim which and how many of a potluck item they are bringing. They can also update the potluck item with more detailed description of precisely what they are bringing (i.e. main course -> turkey).

## Edge Cases

- A single guest buys everything and it is not evenly split
  - Maybe a confirmation message should appear so the user realizes that they are about to claim a disproportionate share of the potluck
- Very few or no items are claimed
  - Automated text message reminder for guests who have not claimed an item
- Guest unclaims a required potluck item or guest who claimed a required potluck item can no longer attend at the last minute.
  - Notify the host and give option for host to send a text blast about it
- New potluck items requested at the last minute
  - Give option for host to send a text blast about it
- Trying to request a potluck item that already exists
  - Throw an error when you try to request a potluck item with the same name of an item that already is on the potluck item list?

Open Questions

- Is there a limit to number of items a potluck can have? Doesn’t seem like we need to arbitrarily restrict unless there is some engineering concern.
- Can potluck items be assigned to specific guests?

Usage Patterns (Important Queries)

- P0: Given a party, load the potluck items and their statuses (whether they’ve been claimed or not)
- P0: Hosts (or maybe even guests) add new potluck items to the list.
- P0: Guests claim potluck items.
  - We must handle collisions + race conditions (two people claiming the same thing at the same exact time).
    - This problem can be prevented with condition checks that rollback a query if the condition fails.
- P1: View what potluck items have been assigned to me (as a guest).
- P1: View what guests have not claimed a potluck item.
  - If the potluck is represented as a NoSQL entity, then although the database query is inexpensive, the computation is linear to number of guests + number of items in the worst case (but this seems unavoidable).
- P2: View what potluck items a guest has brought to previous parties.

Engineering Design

- For each event, an optional potluck entity can be created if the host selects that a party is a potluck
- A potluck entity can be represented as a table, in which case I’d choose to use a NoSQL database like DynamoDB or MongoDB. The entire list of potluck items and it’s claim status could be nested under this schema-less Potluck entity. Choosing NoSQL here has an advantage in being faster to query as we can avoid joins across tables to view the status of an entire potluck.
