import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

fig, ax = plt.subplots()

t1 = "$18^\\\\circ$" # Literal double backslash in Python string: length of '\\' is 2
print("Before:", repr(t1))

# Replace double backslash with single backslash
t1_fixed = t1.replace("\\\\", "\\")
print("After fixed:", repr(t1_fixed))

ax.text(0.5, 0.5, t1_fixed, fontsize=20, ha='center')

plt.savefig("test_replace_success.png")
print("Saved successfully")
