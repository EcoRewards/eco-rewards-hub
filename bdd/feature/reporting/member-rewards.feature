@skipped
Feature:
  As an admin user
  I want to view my schemes and my organisations members usage
  So I can see what my members are doing

  Background:
    Given I am logged in as an administrator
    And a scheme "Warwickshire"
    And the scheme "Warwickshire" contains members:
      | member | rewards |
      | 1001   | 200     |
      | 1002   | 100     |
      | 1003   | 300     |
      | 1004   | 0       |
      | 1005   | 0       |

  Scenario: View rewards
    When I request usage for all the members of "Warwickshire"
    Then I should see:
      | 1001   | 200     |
      | 1002   | 100     |
      | 1003   | 300     |
      | 1004   | 0       |
      | 1005   | 0       |

  Scenario: View uploads
    When I upload a file named "another-upload-file":
      | member | mode  | distance
      | 1005   | walk  | 1000
      | 1005   | bus   | 5000
    Then the scheme "Warwickshire" should contain an audit entry "another-upload-file" with a date
