@skipped
Feature:
  As an organisation or admin user
  I want to report a members usage (member, mode, distance) in bulk
  So they can get their rewards

  Background:
    Given a scheme "Cornwall"
    And the scheme "Cornwall" contains members:
      | member | rewards |
      | 1001   | 0       |
      | 1002   | 100     |
      | 1003   | 0       |
      | 1004   | 0       |
      | 1005   | 0       |

  Scenario: Upload by admin
    Given I am logged in as an administrator
    When I upload a file named "org-file":
      | member | mode  | distance
      | 1001   | walk  | 1000
      | 1001   | bus   | 5000
      | 1002   | train | 2000
      | 1002   | bus   | 4000
      | 1003   | tube  | 2000
      | 1004   | walk  | 4000
    Then the scheme "Cornwall" should contain an audit entry "org-file" with a date
    And the members of "Cornwall" should have the following rewards:
      | member | rewards |
      | 1001   | 150     |
      | 1002   | 400     |
      | 1003   | 20      |
      | 1004   | 100     |
      | 1005   | 0       |

  Scenario: Upload by organisation
    Given an organisation "Uploader Org" in the scheme "Cornwall"
    And I am logged in as "Uploader Org"
    When I upload a file named "uploader-file":
      | member | mode  | distance
      | 1005   | walk  | 1000
      | 1005   | bus   | 5000
    Then the scheme "Cornwall" should contain an audit entry "uploader-file" with a date
    And the members should have the following rewards:
      | member | rewards |
      | 1001   | 150     |
      | 1002   | 400     |
      | 1003   | 20      |
      | 1004   | 100     |

  Scenario: Duplicate upload
    Given an organisation "Uploader Org" in the scheme "Cornwall"
    And I am logged in as "Uploader Org"
    When I upload a file named "uploader-file2":
      | member | mode  | distance
      | 1005   | walk  | 1000
      | 1005   | bus   | 5000
    Then the scheme "Cornwall" should contain an audit entry "uploader-file2" with a date
    And the members should have the following rewards:
      | member | rewards |
      | 1001   | 150     |
      | 1002   | 400     |
      | 1003   | 20      |
      | 1004   | 100     |
    When I upload a file named "uploader-file2":
      | member | mode  | distance
      | 1005   | walk  | 1000
      | 1005   | bus   | 5000
    Then I should receive an error "409"

