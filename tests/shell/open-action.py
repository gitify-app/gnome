import os
import sys

with open(os.environ['GITIFY_PREFS_ACTIONS'], 'a') as actions:
    actions.write(' '.join(sys.argv[1:]) + '\n')
