@Pending
Feature:
  As a member
  I want to be able report my usage (self reporting via web page)
  So I can get eco-rewards

  Background:
    Given a scheme "Surrey"
    And the scheme "Surrey" contains members:
      | member | rewards |
      | 1001   | 0       |
    And an organisation "Some Org" in the scheme "Surrey"

  Scenario: Upload by a member via an organisation
    And I am logged in as "Some Org"
    When I add "5000" meters usage by "bus" for member "1001"
    Then the scheme "Surrey" should contain an audit entry "api-upload" with a date
    And the members should have the following rewards:
      | member | rewards |
      | 1001   | 150     |
