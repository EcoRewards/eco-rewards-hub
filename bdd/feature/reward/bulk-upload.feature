@skipped
Feature:
  As a service provider or admin user
  I want to report a members usage (member, mode, distance) in bulk
  So they can get their rewards

  Background:
    Given I am logged in as an administrator
    And a scheme "Cornwall"
    And an organisation "Cornwall School" in scheme "Cornwall"
    And a group "Class of 2017" in organisation "Cornwall School"
    And the group "Class of 2017" contains members:
      | member | rewards |
      | 1001   | 0       |
      | 1002   | 100     |
      | 1003   | 0       |
      | 1004   | 0       |
      | 1005   | 0       |

  Scenario: Upload by admin
    When I upload a file
      | member | mode  | distance
      | 1001   | walk  | 10.50
      | 1001   | bus   | 50.50
      | 1002   | train | 20.50
      | 1002   | bus   | 40.50
      | 1003   | tube  | 20.50
      | 1004   | walk  | 40.50
    Then the scheme "Cornwall" should contain an audit entry "org-file" with a date
    And these members should have the following rewards:
      | member | rewards |
      | 1001   | 150     |
      | 1002   | 400     |
      | 1003   | 20      |
      | 1004   | 100     |
      | 1005   | 0       |
