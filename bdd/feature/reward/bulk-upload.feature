Feature:
  As a service provider or admin user
  I want to report a members usage (member, mode, distance) in bulk
  So they can get their rewards

  Background:
    Given I am logged in as an administrator
    And I create a scheme "Cornwall"
    And I create an organisation "Cornwall School" in scheme "Cornwall"
    And I create a group "Cornwall 2019" in the organisation "Cornwall School"
    And I create "50" members in the group "Cornwall 2019"

  Scenario: Upload by admin
    When I upload a file
      | member | date                 | mode  | distance |
      | 1      | 2019-12-09T05:51:30Z | walk  | 10.50    |
      | 2      | 2019-12-09T06:20:30Z | bus   | 50.50    |
      | 3      | 2019-12-09T05:51:30Z | train | 20.50    |
      | 4      | 2019-12-09T07:52:30Z | bus   | 40.50    |
      | 5      | 2019-12-09T08:53:30Z | tram  | 20.50    |
      | 6      | 2019-12-09T09:54:30Z | walk  | 40.50    |
    Then I should see the following journeys
      | source | travel date         | mode  | distance |
      | Test   | 2019-12-09 05:51:30 | walk  | 10.50    |
      | Test   | 2019-12-09 06:20:30 | bus   | 50.50    |
      | Test   | 2019-12-09 05:51:30 | train | 20.50    |
      | Test   | 2019-12-09 07:52:30 | bus   | 40.50    |
      | Test   | 2019-12-09 08:53:30 | tram  | 20.50    |
      | Test   | 2019-12-09 09:54:30 | walk  | 40.50    |
#    And I wait until the rewards have been processed
#    And these members should have the following rewards:
#      | member | rewards |
#      | 1001   | 150     |
#      | 1002   | 400     |
#      | 1003   | 20      |
#      | 1004   | 100     |
#      | 1005   | 0       |
