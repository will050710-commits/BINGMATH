import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

fig, ax = plt.subplots()

# Test 1: double backslash literal in Python string
# In Python, r"$18^\circ$" has a single backslash. 
# "$18^\\circ$" also has a single backslash (since \\ in non-raw string escapes to \).
# But if it was parsed from JSON string '"$18^\\\\circ$"', it has a double backslash.
t1 = "$18^\\\\circ$" # This has a literal double backslash in Python
t2 = "$18^\\circ$"   # This has a literal single backslash in Python

print("t1:", repr(t1))
print("t2:", repr(t2))

# Let's clean them:
def clean_latex(s):
    # Replace literal double backslashes with single
    return s.replace("\\\\", "\\")

t1_clean = clean_latex(t1)
print("t1_clean:", repr(t1_clean))

ax.text(0.5, 0.8, t1, fontsize=12, ha='center')
ax.text(0.5, 0.6, t2, fontsize=12, ha='center')
ax.text(0.5, 0.4, t1_clean, fontsize=12, ha='center')

plt.savefig("test_math.png")
print("Done")
