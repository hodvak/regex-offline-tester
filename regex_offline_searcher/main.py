import eel
import re

eel.init('web', allowed_extensions=['.js', '.html'])


@eel.expose
def check_findall(regex, text, flags=0):
    regex = regex.replace('\xa0', ' ')
    text = text.replace('\xa0', ' ')
    if not regex:
        eel.send_data([])
    good_data = []
    try:
        for data in re.finditer(regex, text, flags):
            my_len = len(data.groups()) + 1
            good_data.append([[data.group(i), data.span(i)] for i in range(my_len)])
        eel.send_data(good_data)
    except Exception as e:
        eel.send_data([])

eel.start('index.html')
