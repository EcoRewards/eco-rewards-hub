@wip
Feature:
  As a user
  I want to register my smartcard
  So I can earn reward points

  Scenario: Create a member
    When I create an account with smartcard "654321002222230099"
    And I am logged in as an administrator
    Then I should see a member "654321002222230099"
