Feature:
  As an admin user
  I want to export a report of user journeys
  So I can analyse them

  Background:
    Given I am logged in as an administrator
    And I create a scheme "Anglia"
    And I create an organisation "Anglian School" in scheme "Anglia"
    And I create a group "Anglian 2020" in the organisation "Anglian School"

  Scenario: Upload by admin
    When I create "6" members in the group "Anglian 2020"
    And I upload a file
      | member              | date                 | mode  | distance |
      | 1                   | 2019-12-09T05:51:30Z | walk  | 10.50    |
      | 1                   | 2019-12-09T06:20:30Z | bus   | 50.50    |
      | 3                   | 2019-12-09T05:51:30Z | train | 20.50    |
      | 4                   | 2019-12-09T07:52:30Z | bus   | 40.50    |
      | 5                   | 2019-12-09T08:53:30Z | tram  | 20.50    |
      | 5                   | 2019-12-09T09:54:30Z | walk  | 40.50    |
    And I export the journeys as CSV
    Then the CSV should have at least "6" journeys
