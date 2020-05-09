from django.shortcuts import render, HttpResponse


# simply returns just root of our db
# holding http end points for different models
def root_view(request):
    return render(request, 'root.html')
