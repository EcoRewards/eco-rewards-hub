Feature:
  As an admin user
  I want to be able to create and update members
  So that providers can report data

  Background:
    Given I am logged in as an administrator
    And I create a scheme "East Sussex"
    And I create an organisation "East Sussex School" in scheme "East Sussex"
    And I create a group "Sussex 2019" in the organisation "East Sussex School"
    And I create a group "Sussex 2020" in the organisation "East Sussex School"
    And I create a group "Sussex 2021" in the organisation "East Sussex School"

  @wip
  Scenario: Bulk create and updatemembers
    Given there are "0" members in the group "Sussex 2019"
    When I create "50" members in the group "Sussex 2019"
    Then I should get "50" unique IDs back
    And the group "Sussex 2019" should contain "50" members
    When I change the members group to "Sussex 2021"
    Then there are "50" members in the group "Sussex 2021"
    And there are "0" members in the group "Sussex 2019"

  Scenario: Download member CSV
    When I create "50" members in the group "Sussex 2020"
    And I export the members as CSV
    Then the CSV should have at least "50" members
