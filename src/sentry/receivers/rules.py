from __future__ import absolute_import, print_function

from sentry.signals import project_created

from sentry.models import Rule

DEFAULT_RULE_LABEL = "Send a notification for new issues"
DEFAULT_RULE_DATA = {
    "match": "all",
    "conditions": [{"id": "sentry.rules.conditions.first_seen_event.FirstSeenEventCondition"}],
    "actions": [{"id": "sentry.rules.actions.notify_event.NotifyEventAction"}],
}


def create_default_rules(project, default_rules=True, RuleModel=Rule, **kwargs):
    if default_rules:
        RuleModel.objects.create(project=project, label=DEFAULT_RULE_LABEL, data=DEFAULT_RULE_DATA)


project_created.connect(create_default_rules, dispatch_uid="create_default_rules", weak=False)
